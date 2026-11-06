from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi import Request
from datetime import datetime, timedelta

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
import os
import uuid
import uvicorn

from database import Base, engine, get_db
import models
from models import bit_to_bool, bool_to_bit

app = FastAPI()

# Add CORS middleware
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Product categories are hardcoded (mirrors Java's ProductCategoryService, which
# never actually reads the product_categories/product_subcategories DB tables).
product_categories = {
    "Men": ["T-Shirts", "Jeans", "Shirts"],
    "Women": ["Dresses", "Tops", "Skirts"],
    "Kids": ["Toys", "Clothing", "Books"],
    "Accessories": ["Watches", "Bags", "Jewelry"],
}


@app.on_event("startup")
def on_startup():
    # Defensive only: no-op if Java/Hibernate already created these tables.
    # Never drops or alters the shared schema, and never seeds data into it.
    Base.metadata.create_all(bind=engine)


def _age_value(stored_age):
    """age is now a real nullable int column on users; just pass it through."""
    return stored_age


def _serialize_product_summary(product: models.Product, db: Session):
    """Shape used by get-products / search-products (no sizes/colors/providers/comments)."""
    return {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "image": product.image,
        "category": product.category,
        "subcategory": product.subcategory,
    }


def _serialize_product_details(product: models.Product, db: Session):
    sizes = [s.sizes for s in db.query(models.ProductSize).filter(models.ProductSize.product_id == product.id).all()]
    colors = [
        {"name": c.name, "hex": c.hex}
        for c in db.query(models.ProductColor).filter(models.ProductColor.product_id == product.id).all()
    ]
    providers = [
        p.providers for p in db.query(models.ProductProvider).filter(models.ProductProvider.product_id == product.id).all()
    ]
    comments = [
        c.comments for c in db.query(models.ProductComment).filter(models.ProductComment.product_id == product.id).all()
    ]
    return {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "image": product.image,
        "category": product.category,
        "subcategory": product.subcategory,
        "sizes": sizes,
        "colors": colors,
        "providers": providers,
        "description": product.description,
        "rating": product.rating,
        "comments": comments,
    }


class CreateOrderRequest(BaseModel):
    email: EmailStr
    addressId: str
    products: list
    paymentMethod: str

class CancelOrderRequest(BaseModel):
    email: EmailStr
    orderId: str

class AddFavoriteInput(BaseModel):
    email: EmailStr
    product_id: int

class AddToCartRequest(BaseModel):
    email: EmailStr
    product_id: int
    color: str
    provider: str
    size: str
    quantity: int

class CreateAddressRequest(BaseModel):
    email: EmailStr
    address: str

class DeleteAddressRequest(BaseModel):
    email: EmailStr
    addressId: str

class UpdateAddressRequest(BaseModel):
    email: EmailStr
    addressId: str
    newAddress: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RecordContactRequest(BaseModel):
    email: EmailStr
    comments: str

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailRequest(BaseModel):
    otp: str
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    password: str
    otp: str
    token: str

class UpdateAccountDetailsRequest(BaseModel):
    email: EmailStr
    name: str
    phone: str
    age: int
    country: str

@app.post("/auth/login/")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user and user.password == request.password:
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid email or password")

@app.post("/auth/signup/")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=request.email,
        password=request.password,
        verified=bool_to_bit(False),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate verification token (mocked)
    token = str(uuid.uuid4())
    db.add(models.VerificationToken(
        token=token,
        user_id=user.id,
        otp="123456",
        used=bool_to_bit(False),
        expiry_date=datetime.utcnow() + timedelta(days=1),
    ))

    db.commit()
    return {"message": "Signup successful. Please verify your email.", "token": token}

@app.post("/auth/verify-email/")
def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    token_data = db.query(models.VerificationToken).filter(models.VerificationToken.token == request.token).first()
    if token_data and token_data.otp == request.otp and not bit_to_bool(token_data.used):
        user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
        if user:
            user.verified = bool_to_bit(True)
        token_data.used = bool_to_bit(True)
        db.commit()
        return {"message": "Email verified successfully"}
    raise HTTPException(status_code=400, detail="Invalid OTP or token")

@app.post("/auth/forgot-password/")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user:
        # Generate password reset token (mocked)
        token = str(uuid.uuid4())
        user.reset_token = token
        user.reset_otp = "reset123"
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        return {"message": "Password reset link sent to your email", "token": token}
    raise HTTPException(status_code=404, detail="Email not registered")

@app.post("/auth/reset-password/")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.reset_token == request.token).first()
    if user and user.reset_otp == request.otp:
        user.password = request.password
        user.reset_token = None
        user.reset_otp = None
        user.reset_token_expiry = None
        db.commit()
        return {"message": "Password reset successfully"}
    raise HTTPException(status_code=400, detail="Invalid OTP or token")

@app.get("/get-products/")
def get_products(category: str = Query(...), subcategory: Optional[str] = Query(None), page: int = Query(...), db: Session = Depends(get_db)):
    query = db.query(models.Product).filter(models.Product.category == category)
    if subcategory not in [None, "none"]:
        query = query.filter(models.Product.subcategory == subcategory)

    all_products = query.order_by(models.Product.id).all()

    page_size = 15
    start = (page - 1) * page_size
    end = start + page_size
    total_pages = (len(all_products) + page_size - 1) // page_size
    page_products = all_products[start:end]

    return {
        "products": [_serialize_product_summary(p, db) for p in page_products],
        "total_pages": total_pages
    }

@app.get("/search-products/")
def search_products(query: str = Query(...), db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(models.Product.name.ilike(f"%{query}%")).all()
    return {
        "products": [_serialize_product_summary(p, db) for p in products]
    }

@app.get("/get-product-categories/")
def get_product_categories():
    return {
        "categories": product_categories
    }

@app.get("/get-product-details/{product_id}")
def get_product_details(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product:
        return _serialize_product_details(product, db)
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/get-account-details/")
def get_account_details(email: EmailStr, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is not None:
        return {
            "email": email,
            "name": user.name,
            "age": _age_value(user.age),
            "country": user.country,
            "phone": user.phone
        }
    raise HTTPException(status_code=404, detail="Account details not found")

@app.post("/update-account-details/")
def update_account_details(request: UpdateAccountDetailsRequest, db: Session = Depends(get_db)):
    # Check if the user exists
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user is not None:
        # Update account details
        user.name = request.name
        user.phone = request.phone
        user.age = request.age
        user.country = request.country
        db.commit()

        updated_details = {
            "name": user.name,
            "phone": user.phone,
            "age": _age_value(user.age),
            "country": user.country
        }
        return {
            "message": "Account details updated successfully",
            "updated_details": updated_details
        }
    raise HTTPException(status_code=404, detail="Account not found")


@app.post("/add-to-cart/")
def add_to_cart(request: AddToCartRequest, db: Session = Depends(get_db)):
    # Check if the user exists
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Add item to the user's cart
    cart_item = models.CartItem(
        id=str(uuid.uuid4()),
        user_id=user.id,
        product_id=request.product_id,
        color=request.color,
        provider=request.provider,
        size=request.size,
        quantity=request.quantity
    )
    db.add(cart_item)
    db.commit()

    user_cart = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()

    return {
        "message": "Item added to cart successfully",
        "cart": [
            {
                "cart_item_id": item.id,
                "product_id": item.product_id,
                "color": item.color,
                "provider": item.provider,
                "size": item.size,
                "quantity": item.quantity
            }
            for item in user_cart
        ]
    }

@app.post("/record-contact/")
def record_contact(request: RecordContactRequest, db: Session = Depends(get_db)):
    db.add(models.Contact(
        email=request.email,
        comments=request.comments,
        created_at=datetime.utcnow(),
    ))
    db.commit()

    # Return a success message
    return {
        "message": "Contact recorded successfully",
        "email": request.email
    }


@app.get("/get-cart/")
def get_cart(email: EmailStr, db: Session = Depends(get_db)):
    # Check if the user exists
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the user's cart
    user_cart = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()

    # Fetch detailed product info for each cart item
    detailed_cart = []
    for item in user_cart:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            detailed_cart.append({
                "cart_item_id": item.id,
                "product_id": product.id,
                "name": product.name,
                "price": product.price,
                "image": product.image,  # Include the image field
                "color": item.color,
                "provider": item.provider,
                "size": item.size,
                "quantity": item.quantity
            })

    return {
        "email": email,
        "cart": detailed_cart
    }


@app.delete("/remove-from-cart/")
async def remove_from_cart(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    email = body.get("email")
    cart_item_id = body.get("cart_item_id")

    # Validate email
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate cart exists
    user_cart = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()
    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart is empty")

    # Remove the item with the given cart_item_id
    item_to_remove = next((item for item in user_cart if item.id == cart_item_id), None)

    # Check if an item was removed
    if item_to_remove is None:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item_to_remove)
    db.commit()

    remaining_cart = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()

    return {
        "message": "Item removed from cart successfully",
        "cart": [
            {
                "cart_item_id": item.id,
                "product_id": item.product_id,
                "color": item.color,
                "provider": item.provider,
                "size": item.size,
                "quantity": item.quantity
            }
            for item in remaining_cart
        ]
    }


@app.post("/add-favorite/")
def add_favorite(request: AddFavoriteInput, db: Session = Depends(get_db)):
    # Check if the user exists
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the product exists
    product = db.query(models.Product).filter(models.Product.id == int(request.product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Add the product to the user's favorites (if not already present)
    existing_favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user.id,
        models.Favorite.product_id == request.product_id
    ).first()
    if not existing_favorite:
        db.add(models.Favorite(user_id=user.id, product_id=request.product_id))
        db.commit()

    user_favorites = db.query(models.Favorite).filter(models.Favorite.user_id == user.id).all()

    return {
        "message": "Product added to favorites successfully",
        "favorites": [f.product_id for f in user_favorites]
    }

@app.get("/get-favorites/")
def get_favorites(email: EmailStr, db: Session = Depends(get_db)):
    # Check if the user exists
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the user's favorites
    user_favorites = db.query(models.Favorite).filter(models.Favorite.user_id == user.id).all()

    return {
        "email": email,
        "favorites": [f.product_id for f in user_favorites]
    }

@app.delete("/remove-favorite/")
def remove_favorite(request: AddFavoriteInput, db: Session = Depends(get_db)):
    # Check if the user exists
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user has favorites, otherwise raise a 404
    user_favorites = db.query(models.Favorite).filter(models.Favorite.user_id == user.id).all()
    if not user_favorites:
        raise HTTPException(status_code=404, detail="No favorites found for this user")

    # Check if the product exists in the user's favorites
    favorite_to_remove = next((f for f in user_favorites if f.product_id == request.product_id), None)
    if favorite_to_remove is None:
        raise HTTPException(status_code=404, detail="Product not found in favorites")

    # Remove the product from the user's favorites
    db.delete(favorite_to_remove)
    db.commit()

    remaining_favorites = db.query(models.Favorite).filter(models.Favorite.user_id == user.id).all()

    return {
        "message": "Product removed from favorites successfully",
        "favorites": [f.product_id for f in remaining_favorites]
    }


@app.post("/create-address/")
def create_address(request: CreateAddressRequest, db: Session = Depends(get_db)):
    # Validate user
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a unique address ID
    address_id = str(uuid.uuid4())

    db.add(models.Address(id=address_id, user_id=user.id, address=request.address))
    db.commit()

    user_addresses = db.query(models.Address).filter(models.Address.user_id == user.id).all()

    return {
        "message": "Address added successfully",
        "address_id": address_id,
        "addresses": [
            {"address_id": a.id, "address": a.address} for a in user_addresses
        ]
    }

@app.get("/get-addresses/")
def get_addresses(email: EmailStr, db: Session = Depends(get_db)):
    # Validate user
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get addresses
    user_addresses = db.query(models.Address).filter(models.Address.user_id == user.id).all()

    return {
        "email": email,
        "addresses": [
            {"address_id": a.id, "address": a.address} for a in user_addresses
        ]
    }

@app.delete("/delete-address/")
async def delete_address(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    email = body.get("email")
    address_id = body.get("addressId")

    # Validate user
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user's addresses
    user_addresses = db.query(models.Address).filter(models.Address.user_id == user.id).all()

    # Find and delete the address
    address_to_delete = next((a for a in user_addresses if a.id == address_id), None)

    if address_to_delete is None:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(address_to_delete)
    db.commit()

    remaining_addresses = db.query(models.Address).filter(models.Address.user_id == user.id).all()

    return {
        "message": "Address deleted successfully",
        "addresses": [
            {"address_id": a.id, "address": a.address} for a in remaining_addresses
        ]
    }

@app.put("/update-address/")
def update_address(request: UpdateAddressRequest, db: Session = Depends(get_db)):
    # Validate user
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user's addresses
    user_addresses = db.query(models.Address).filter(models.Address.user_id == user.id).all()

    # Find and update the address
    for addr in user_addresses:
        if addr.id == request.addressId:
            addr.address = request.newAddress
            db.commit()
            return {
                "message": "Address updated successfully",
                "addresses": [
                    {"address_id": a.id, "address": a.address} for a in user_addresses
                ]
            }

    raise HTTPException(status_code=404, detail="Address not found")


@app.post("/create-order/")
def create_order(request: CreateOrderRequest, db: Session = Depends(get_db)):
    # Validate user
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate address
    user_addresses = db.query(models.Address).filter(models.Address.user_id == user.id).all()
    if not any(addr.id == request.addressId for addr in user_addresses):
        raise HTTPException(status_code=404, detail="Address not found")

    # Validate products
    for product in request.products:
        product_id = int(product["productId"])
        if not db.query(models.Product).filter(models.Product.id == product_id).first():
            raise HTTPException(status_code=404, detail=f"Product with ID {product['productId']} not found")

    # Generate a unique order ID
    order_id = str(uuid.uuid4())

    order = models.Order(
        id=order_id,
        user_id=user.id,
        address_id=request.addressId,
        payment_method=request.paymentMethod,
        status="confirmed",
        created_at=datetime.utcnow()
    )
    db.add(order)

    for product in request.products:
        db.add(models.OrderItem(
            order_id=order_id,
            product_id=int(product["productId"]),
            quantity=product.get("quantity"),
            color=product.get("color"),
            size=product.get("size"),
            provider=product.get("provider"),
        ))

    db.commit()

    return {
        "message": "Order created successfully",
        "order_id": order_id,
        "order_status": "confirmed"
    }

@app.get("/get-orders/")
def get_orders(email: EmailStr, db: Session = Depends(get_db)):
    # Validate user
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get orders for the user
    user_orders = db.query(models.Order).filter(models.Order.user_id == user.id).all()

    orders_response = []
    for o in user_orders:
        order_items = db.query(models.OrderItem).filter(models.OrderItem.order_id == o.id).all()
        orders_response.append({
            "order_id": o.id,
            "address_id": o.address_id,
            "products": [
                {
                    "productId": item.product_id,
                    "quantity": item.quantity,
                    "color": item.color,
                    "size": item.size,
                    "provider": item.provider,
                }
                for item in order_items
            ],
            "payment_method": o.payment_method,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None
        })

    return {
        "email": email,
        "orders": orders_response
    }

@app.post("/cancel-order/")
def cancel_order(request: CancelOrderRequest, db: Session = Depends(get_db)):
    # Validate user
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate order
    order = db.query(models.Order).filter(
        models.Order.user_id == user.id,
        models.Order.id == request.orderId
    ).first()

    if order:
        if order.status == "cancelled":
            raise HTTPException(status_code=400, detail="Order already cancelled")
        order.status = "cancelled"
        db.commit()
        return {
            "message": "Order cancelled successfully",
            "order_id": request.orderId,
            "order_status": "cancelled"
        }

    raise HTTPException(status_code=404, detail="Order not found")


if __name__ == "__main__":
    uvicorn.run('app:app', host="0.0.0.0", port=int(os.environ.get("PORT", 9891)), reload=True)
