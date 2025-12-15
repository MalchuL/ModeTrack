"""make timer timestamps timezone aware

Revision ID: 202501151245
Revises: 202501151200
Create Date: 2025-01-15 12:45:00
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '202501151245'
down_revision = '202501151200'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        # SQLite cannot alter column types; skip because tz-awareness is not enforced there.
        return
    op.alter_column("pomodoro_timer_state", "ends_at", type_=sa.DateTime(timezone=True))
    op.alter_column("pomodoro_timer_state", "updated_at", type_=sa.DateTime(timezone=True))


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        return
    op.alter_column("pomodoro_timer_state", "ends_at", type_=sa.DateTime(timezone=False))
    op.alter_column("pomodoro_timer_state", "updated_at", type_=sa.DateTime(timezone=False))
