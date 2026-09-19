from sqlalchemy.orm import Session

from app.models.usuario import Usuario


class UsuarioRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_email(
        self,
        email: str,
    ) -> Usuario | None:

        return (
            self.db.query(Usuario)
            .filter(Usuario.email == email)
            .first()
        )

    def get_by_id(
        self,
        user_id,
    ) -> Usuario | None:

        return (
            self.db.query(Usuario)
            .filter(Usuario.id == user_id)
            .first()
        )

    def create(
        self,
        usuario: Usuario,
    ) -> Usuario:

        self.db.add(usuario)
        self.db.flush()
        self.db.refresh(usuario)

        return usuario