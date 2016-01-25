import Sequelize from 'sequelize';
import suspend from 'suspend';

export default suspend.promise(function*(config) {
  const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: 'localhost',
    dialect: 'postgres',
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    logging: false
  });

  sequelize.define('result', {
    file_path: { type: Sequelize.STRING, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    warning: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: false },
    info: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: false },
    status: { type: Sequelize.ENUM('success', 'failure'), allowNull: false },
    final_message: { type: Sequelize.STRING, allowNull: false },
    is_failed: {
      type: new Sequelize.VIRTUAL(Sequelize.BOOLEAN),
      get: function() { return this.get('status') === 'failure'; }
    }
  });

  sequelize.define('group', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true }
  });

  sequelize.define('file', {
    name: { type: Sequelize.STRING, allowNull: false },
    media: { type: Sequelize.STRING, allowNull: false },
    content: { type: Sequelize.BLOB, allowNull: false }
  });

  sequelize.models.result.belongsTo(sequelize.models.group);
  sequelize.models.file.belongsTo(sequelize.models.result, {
    deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED
  });

  yield sequelize.sync({ force: true });

  return sequelize;
});
