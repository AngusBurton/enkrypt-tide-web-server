const db = require("../models");
var jose = require('jose');

const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
exports.create = (req, res) => {
  // Validate request
  // if (!req.body.title) {
  //   res.status(400).send({
  //     message: "Content can not be empty!"
  //   });
  //   return;
  // }

  // Create a Tutorial
  const tutorial = {
    uid: req.body.uid,
    phrase: req.body.phrase,
    publicKey: req.body.publicKey
  };

  // Save Tutorial in the database
  Tutorial.create(tutorial)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial."
      });
    });
};

// Retrievea phrase from the database.
exports.findAll = async (req, res) => {
  // const uid = req.query.uid;
  const jwt = req.query.jwt;
  const publicKey = req.query.publicKey;
  // console.log(Buffer.from(publicKey + '=', "base64"));

//   const header = new Uint8Array([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]) 
//   const c = concatTypedArrays(header, Uint8Array.from(Buffer.from(publicKey + '=', "base64")))
//   console.log(btoa(c))

  const bufString = '302a300506032b6570032100' + Buffer.from(publicKey + '=', "base64").toString('hex');
  
  console.log(bufString)
  
  function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
        str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
      );
  }

  const spki = `-----BEGIN PUBLIC KEY-----
  ${hexToBase64(bufString)}
  -----END PUBLIC KEY-----`
  
  console.log(spki)
  const ecPublicKey = await jose.importSPKI(spki, 'ES256')

  try {
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, ecPublicKey)

    console.log(payload)
    if (payload.uid) {
      const uid = payload.uid;
      Tutorial.findAll({ where: uid ? { uid: { [Op.like]: `%${uid}%` } } : null })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving phrases."
        });
      });
    } else {
      return res.status(400).send({
        message: 'An error has occurred.'
      })
    }
  } catch (err) {
    console.log(err.message)    
  }
  
  // Tutorial.findAll({ where: null })
  // .then(data => {
  //   res.send(data);
  // })
  // .catch(err => {
  //   res.status(500).send({
  //     message:
  //       err.message || "Some error occurred while retrieving phrases."
  //   });
  // });

};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id
      });
    });
};

// Update a Tutorial by the id in the request
// exports.update = (req, res) => {
//   const id = req.params.id;

//   Tutorial.update(req.body, {
//     where: { id: id }
//   })
//     .then(num => {
//       if (num == 1) {
//         res.send({
//           message: "Tutorial was updated successfully."
//         });
//       } else {
//         res.send({
//           message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({
//         message: "Error updating Tutorial with id=" + id
//       });
//     });
// };

// Delete a Tutorial with the specified id in the request
// exports.delete = (req, res) => {
//   const id = req.params.id;

//   Tutorial.destroy({
//     where: { id: id }
//   })
//     .then(num => {
//       if (num == 1) {
//         res.send({
//           message: "Tutorial was deleted successfully!"
//         });
//       } else {
//         res.send({
//           message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({
//         message: "Could not delete Tutorial with id=" + id
//       });
//     });
// };

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Tutorial.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Tutorials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};
