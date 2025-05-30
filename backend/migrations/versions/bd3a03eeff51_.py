"""empty message

Revision ID: bd3a03eeff51
Revises: 
Create Date: 2025-05-14 16:25:18.639439

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bd3a03eeff51'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('confidential',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('file_name', sa.String(length=45), nullable=False),
    sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('queries',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('is_detected', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('detected',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('query_id', sa.Integer(), nullable=False),
    sa.Column('confidential_id', sa.Integer(), nullable=False),
    sa.Column('position', sa.JSON(), nullable=True),
    sa.Column('similarity', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['confidential_id'], ['confidential.id'], ),
    sa.ForeignKeyConstraint(['query_id'], ['queries.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('detected', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_detected_confidential_id'), ['confidential_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_detected_query_id'), ['query_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('detected', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_detected_query_id'))
        batch_op.drop_index(batch_op.f('ix_detected_confidential_id'))

    op.drop_table('detected')
    op.drop_table('queries')
    op.drop_table('confidential')
    # ### end Alembic commands ###
