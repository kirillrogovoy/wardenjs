const co = require('co')

module.exports = co.wrap(function* saveToDb(db, result, filePath, groupName = null) {
  const transaction = yield db.transaction()
  if (groupName) {
    yield db.models.group.upsert({ name: groupName }, { transaction })
  }
  const resultRow = yield db.models.result.create({
    file_path: filePath,
    name: result.name,
    warning: result.warning,
    info: result.info,
    status: result.status,
    final_message: result.finalMessage,
    group_id: groupName ? (yield db.models.group.findOne({
      where: {
        name: groupName
      },
      transaction
    }
    )).id : null
  }, {transaction})
  if (result.files.length) {
    yield Promise.all(result.files.map((file) => {
      return db.models.file.create(
        Object.assign({result_id: resultRow.id}, file),
        { transaction }
      )
    }))
  }
  transaction.commit()
})
