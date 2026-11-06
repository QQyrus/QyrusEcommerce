import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_PORT = os.environ.get("MYSQL_PORT", "3307")
MYSQL_DATABASE_NAME = os.environ.get("MYSQL_DATABASE_NAME", "ecommerce")
MYSQL_USER = os.environ.get("MYSQL_USER", "user")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "password")

DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE_NAME}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
