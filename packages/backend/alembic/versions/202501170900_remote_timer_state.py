"""Remote timer state with uuid and status

Revision ID: 202501170900
Revises: 202501151245_update_timer_timestamptz
Create Date: 2025-01-17 09:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = "202501170900"
down_revision = "202501151245"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"
    inspector = sa.inspect(bind)
    existing_cols = {col["name"] for col in inspector.get_columns("pomodoro_timer_state")}

    if "current_id" not in existing_cols:
        op.add_column(
            "pomodoro_timer_state",
            sa.Column(
                "current_id",
                sa.String(length=36),
                nullable=False,
                server_default=str(uuid.uuid4()),
            ),
        )
    if "status" not in existing_cols:
        op.add_column("pomodoro_timer_state", sa.Column("status", sa.String(length=16), nullable=False, server_default="not_started"))
    if "elapsed_seconds" not in existing_cols:
        op.add_column("pomodoro_timer_state", sa.Column("elapsed_seconds", sa.Integer(), nullable=False, server_default="0"))
    if "started_at" not in existing_cols:
        op.add_column("pomodoro_timer_state", sa.Column("started_at", sa.DateTime(timezone=True), nullable=True))
    # existing table already has ends_at with timezone True from prior migration
    if not is_sqlite:
        op.create_unique_constraint("uq_pomodoro_timer_state_current_id", "pomodoro_timer_state", ["current_id"])


def downgrade() -> None:
    op.drop_constraint("uq_pomodoro_timer_state_current_id", "pomodoro_timer_state", type_="unique")
    op.drop_column("pomodoro_timer_state", "started_at")
    op.drop_column("pomodoro_timer_state", "elapsed_seconds")
    op.drop_column("pomodoro_timer_state", "status")
    op.drop_column("pomodoro_timer_state", "current_id")
