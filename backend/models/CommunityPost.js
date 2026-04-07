// ── CommunityPost Model ────────────────────────────────────────────────

module.exports = (sequelize, DataTypes) => {
  const CommunityPost = sequelize.define(
    'CommunityPost',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      author_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      author_avatar: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [1, 5000],
            msg: 'Caption must be between 1 and 5000 characters',
          },
        },
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      tableName: 'community_posts',
      timestamps: false,
      underscored: false,
    }
  );

  CommunityPost.associate = (models) => {
    CommunityPost.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return CommunityPost;
};
