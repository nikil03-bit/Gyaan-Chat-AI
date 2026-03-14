import traceback, sys
try:
    from app.main import app
    print("Backend imports OK!")
except Exception:
    with open("import_error.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Error written to import_error.txt")
