"""Extend pomodoro_settings with long break and toggles

Revision ID: 202501171000
Revises: 202501170905
Create Date: 2025-01-17 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202501171000"
down_revision = "202501170905"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("pomodoro_settings")}

    if "long_break_minutes" not in cols:
        op.add_column("pomodoro_settings", sa.Column("long_break_minutes", sa.Integer(), nullable=False, server_default="15"))
    if "long_break_interval" not in cols:
        op.add_column("pomodoro_settings", sa.Column("long_break_interval", sa.Integer(), nullable=False, server_default="4"))
    if "sound_enabled" not in cols:
        op.add_column("pomodoro_settings", sa.Column("sound_enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    if "auto_start_breaks" not in cols:
        op.add_column("pomodoro_settings", sa.Column("auto_start_breaks", sa.Boolean(), nullable=False, server_default=sa.false()))
    if "auto_start_pomodoros" not in cols:
        op.add_column("pomodoro_settings", sa.Column("auto_start_pomodoros", sa.Boolean(), nullable=False, server_default=sa.false()))

    # Backfill existing single settings row with defaults to avoid NULLs
    op.execute(
        """
        UPDATE pomodoro_settings
        SET long_break_minutes = COALESCE(long_break_minutes, 15),
            long_break_interval = COALESCE(long_break_interval, 4),
            sound_enabled = COALESCE(sound_enabled, 1),
            auto_start_breaks = COALESCE(auto_start_breaks, 0),
            auto_start_pomodoros = COALESCE(auto_start_pomodoros, 0)
        """
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c["name"] for c in inspector.get_columns("pomodoro_settings")}

    if "auto_start_pomodoros" in cols:
        op.drop_column("pomodoro_settings", "auto_start_pomodoros")
    if "auto_start_breaks" in cols:
        op.drop_column("pomodoro_settings", "auto_start_breaks")
    if "sound_enabled" in cols:
        op.drop_column("pomodoro_settings", "sound_enabled")
    if "long_break_interval" in cols:
        op.drop_column("pomodoro_settings", "long_break_interval")
    if "long_break_minutes" in cols:
        op.drop_column("pomodoro_settings", "long_break_minutes")
