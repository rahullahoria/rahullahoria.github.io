const express =  require('express');
const router = express.Router({mergeParams: true});

let post =  require('./post');
let get =  require('./get');


router.post('/login', post.login);
router.post('/', post.signup);


router.get('/', get.getAll);
router.get('/:id', get.getById);


module.exports = router;