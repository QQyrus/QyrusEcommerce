from sqlalchemy import (
    Column,
    Double,
    ForeignKey,
    Integer,
    String,
    DateTime,
    BigInteger,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.mysql import BIT
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    age = Column(Integer, nullable=True)
    country = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    name = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)
    phone = Column(String(255), nullable=True)
    reset_otp = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    verified = Column(BIT(1), nullable=False, default=b"\x00")


class Product(Base):
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    category = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    image = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    price = Column(Double, nullable=True)
    rating = Column(Double, nullable=True)
    subcategory = Column(String(255), nullable=True)

    sizes = relationship("ProductSize", backref="product", cascade="all, delete-orphan")
    colors = relationship("ProductColor", backref="product", cascade="all, delete-orphan")
    providers = relationship("ProductProvider", backref="product", cascade="all, delete-orphan")
    comments = relationship("ProductComment", backref="product", cascade="all, delete-orphan")


class ProductSize(Base):
    # Hibernate @ElementCollection table: no surrogate id column, just
    # (product_id, value) rows. Use a composite primary_key mapping since
    # SQLAlchemy requires one, even though MySQL has no real PK/unique here.
    __tablename__ = "product_sizes"

    product_id = Column(BigInteger, ForeignKey("products.id"), primary_key=True, nullable=False)
    sizes = Column(String(255), primary_key=True, nullable=True)


class ProductColor(Base):
    __tablename__ = "product_colors"

    product_id = Column(BigInteger, ForeignKey("products.id"), primary_key=True, nullable=False)
    hex = Column(String(255), primary_key=True, nullable=True)
    name = Column(String(255), nullable=True)


class ProductProvider(Base):
    __tablename__ = "product_providers"

    product_id = Column(BigInteger, ForeignKey("products.id"), primary_key=True, nullable=False)
    providers = Column(String(255), primary_key=True, nullable=True)


class ProductComment(Base):
    __tablename__ = "product_comments"

    product_id = Column(BigInteger, ForeignKey("products.id"), primary_key=True, nullable=False)
    comments = Column(String(255), primary_key=True, nullable=True)


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String(255), primary_key=True)
    color = Column(String(255), nullable=True)
    provider = Column(String(255), nullable=True)
    quantity = Column(Integer, nullable=True)
    size = Column(String(255), nullable=True)
    product_id = Column(BigInteger, ForeignKey("products.id"), nullable=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_favorites_user_product"),)

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    product_id = Column(BigInteger, ForeignKey("products.id"), nullable=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)


class Address(Base):
    __tablename__ = "addresses"

    id = Column(String(255), primary_key=True)
    address = Column(String(255), nullable=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(255), primary_key=True)
    created_at = Column(DateTime, nullable=True)
    payment_method = Column(String(255), nullable=True)
    status = Column(String(255), nullable=True)
    address_id = Column(String(255), ForeignKey("addresses.id"), nullable=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)

    items = relationship("OrderItem", backref="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    color = Column(String(255), nullable=True)
    provider = Column(String(255), nullable=True)
    quantity = Column(Integer, nullable=True)
    size = Column(String(255), nullable=True)
    order_id = Column(String(255), ForeignKey("orders.id"), nullable=True)
    product_id = Column(BigInteger, ForeignKey("products.id"), nullable=True)


class VerificationToken(Base):
    __tablename__ = "verification_tokens"

    token = Column(String(255), primary_key=True)
    expiry_date = Column(DateTime, nullable=True)
    otp = Column(String(255), nullable=True)
    used = Column(BIT(1), nullable=False, default=b"\x00")
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    comments = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)
    email = Column(String(255), nullable=False)


def bit_to_bool(value) -> bool:
    """Convert a MySQL bit(1) value read back through PyMySQL into a clean Python bool.

    PyMySQL typically returns bit(1) columns as bytes (b'\\x01' / b'\\x00'), but may
    also hand back an int in some driver paths. Handle both defensively.
    """
    if value is None:
        return False
    if isinstance(value, bytes):
        return bool(value[0]) if len(value) > 0 else False
    return bool(value)


def bool_to_bit(value: bool) -> bytes:
    """Convert a Python bool into the bytes form bit(1) columns expect on write."""
    return b"\x01" if value else b"\x00"
