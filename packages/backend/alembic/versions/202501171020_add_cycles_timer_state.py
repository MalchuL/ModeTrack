"""Add cycles_completed to pomodoro_timer_state

Revision ID: 202501171020
Revises: 202501171000
Create Date: 2025-01-17 10:20:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202501171020"
down_revision = "202501171000"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("pomodoro_timer_state")}
    if "cycles_completed" not in cols:
        op.add_column(
            "pomodoro_timer_state",
            sa.Column("cycles_completed", sa.Integer(), nullable=False, server_default="0"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("pomodoro_timer_state")}
    if "cycles_completed" in cols:
        op.drop_column("pomodoro_timer_state", "cycles_completed")
