module.exports = (sequelize, Sequelize) => {
  const Tutorial = sequelize.define("phrase", {
    uid: {
      type: Sequelize.STRING
    },
    phrase: {
      type: Sequelize.TEXT
    }
  });

  return Tutorial;
};