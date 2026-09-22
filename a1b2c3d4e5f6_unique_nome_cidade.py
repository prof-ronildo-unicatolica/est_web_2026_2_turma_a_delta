"""adiciona unique constraint no nome da cidade

Revision ID: a1b2c3d4e5f6
Revises: f51c62be188a
Create Date: 2026-09-14 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f51c62be188a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint('uq_cidades_nome', 'cidades', ['nome'])


def downgrade() -> None:
    op.drop_constraint('uq_cidades_nome', 'cidades', type_='unique')