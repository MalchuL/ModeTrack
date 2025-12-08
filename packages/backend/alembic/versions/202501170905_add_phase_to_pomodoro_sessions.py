"""Add phase to pomodoro_sessions if missing

Revision ID: 202501170905
Revises: 202501170900
Create Date: 2025-01-17 09:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202501170905"
down_revision = "202501170900"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = {col["name"] for col in inspector.get_columns("pomodoro_sessions")}
    if "phase" not in existing_cols:
        op.add_column(
            "pomodoro_sessions",
            sa.Column("phase", sa.String(length=16), nullable=False, server_default="work"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = {col["name"] for col in inspector.get_columns("pomodoro_sessions")}
    if "phase" in existing_cols:
        op.drop_column("pomodoro_sessions", "phase")
