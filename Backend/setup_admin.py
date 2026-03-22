from pathlib import Path
from dotenv import load_dotenv
import os, psycopg2

load_dotenv(Path(__file__).parent / '.env')

db_url = os.getenv('DATABASE_URL').replace('postgresql+psycopg2://', 'postgresql://')
conn = psycopg2.connect(db_url)
conn.autocommit = True
cur = conn.cursor()

# Add column if doesn't exist
cur.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='users' AND column_name='is_superadmin'
        ) THEN
            ALTER TABLE users ADD COLUMN is_superadmin BOOLEAN DEFAULT FALSE;
        END IF;
    END $$;
""")
print("Column is_superadmin ensured.")

# Show current users
cur.execute("SELECT email, name, is_superadmin FROM users ORDER BY created_at")
rows = cur.fetchall()
print(f"Found {len(rows)} users:")
for r in rows:
    print(f"  {r[2]} | {r[1]} | {r[0]}")

conn.close()
