from sqlalchemy import create_engine
from dotenv import load_dotenv
import os


load_dotenv()

# Support both lowercase and uppercase env var names.
USER = os.getenv("user") or os.getenv("USER")
PASSWORD = os.getenv("password") or os.getenv("PASSWORD")
HOST = os.getenv("host") or os.getenv("HOST")
PORT = os.getenv("port") or os.getenv("PORT")
DBNAME = os.getenv("dbname") or os.getenv("DBNAME")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
engine = create_engine(DATABASE_URL)

try:
    with engine.connect():
        print("Connection successful!")
except Exception as e:
    print(f"Failed to connect: {e}")
