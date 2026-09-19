from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.usuario import Usuario


def seed_admin():
    db = SessionLocal()

    try:
        email = "admin@hotel.com"

        admin = (
            db.query(Usuario)
            .filter(Usuario.email == email)
            .first()
        )

        if admin:
            print("Admin já existe.")
            return

        admin = Usuario(
            nome="Administrador",
            email=email,
            senha_hash=hash_password("admin123"),
            is_admin=True,
        )

        db.add(admin)
        db.commit()

        print("Admin criado com sucesso.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()