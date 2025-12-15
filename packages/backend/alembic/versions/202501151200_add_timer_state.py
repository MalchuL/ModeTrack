"""add pomodoro timer state table

Revision ID: 202501151200
Revises: 
Create Date: 2025-01-15 12:00:00
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '202501151200'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pomodoro_timer_state",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("phase", sa.String(length=16), nullable=False, server_default="work"),
        sa.Column("is_running", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("remaining_seconds", sa.Integer(), nullable=False, server_default="1500"),
        sa.Column("ends_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("pomodoro_timer_state")
