import os
from datetime import datetime

def backup_db():
    filename = f"backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.sql"
    os.system(f"pg_dump -U postgres -h db starfirecad > {filename}")
    print(f"Backup saved as {filename}")

if __name__ == '__main__':
    backup_db()
