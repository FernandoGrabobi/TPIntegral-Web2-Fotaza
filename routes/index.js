const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const reportController = require('../controllers/reportController');
const followController = require('../controllers/followController');
const notificationController = require('../controllers/notificationController');
const collectionController = require('../controllers/collectionController');
const searchController = require('../controllers/searchController');
const userController = require('../controllers/userController');

const { requireLogin, requireValidator } = require('../middlewares/auth');

// ── Auth ──────────────────────────────────────────
router.get('/auth/login', authController.showLogin);
router.post('/auth/login', authController.login);
router.get('/auth/register', authController.showRegister);
router.post('/auth/register', authController.register);
router.post('/auth/logout', requireLogin, authController.logout);

// ── Home & Feed ───────────────────────────────────
router.get('/', postController.home);
router.get('/feed', requireLogin, postController.feed);

// ── Búsqueda ──────────────────────────────────────
router.get('/search', searchController.search);

// ── Posts ─────────────────────────────────────────
router.get('/posts/create', requireLogin, postController.showCreate);
router.post('/posts/create', requireLogin,
  postController.upload.array('images', 10),
  postController.create
);
router.get('/posts/mine', requireLogin, postController.myPosts);
router.get('/posts/:id', postController.show);
router.get('/posts/:id/edit', requireLogin, postController.showEdit);
router.post('/posts/:id/edit', requireLogin,
  postController.upload.array('images', 10),
  postController.update
);
router.post('/posts/:id/delete', requireLogin, postController.delete);
router.post('/posts/:id/toggle-comments', requireLogin, postController.toggleComments);
router.post('/posts/:id/rate', requireLogin, postController.rate);
router.post('/posts/:id/interested', requireLogin, postController.markInterested);
router.post('/posts/:id/report', requireLogin, reportController.reportPost);

// ── Comentarios ───────────────────────────────────
router.post('/posts/:id/comments', requireLogin, commentController.create);
router.post('/comments/:id/delete', requireLogin, commentController.delete);
router.post('/comments/:id/report', requireLogin, reportController.reportComment);

// ── Panel validador ───────────────────────────────
router.get('/validator', requireLogin, requireValidator, reportController.validatorPanel);
router.post('/validator/posts/:id/remove', requireLogin, requireValidator, reportController.removePost);
router.post('/validator/posts/:id/dismiss', requireLogin, requireValidator, reportController.dismissReports);

// ── Follows ───────────────────────────────────────
router.post('/users/:id/follow', requireLogin, followController.follow);
router.post('/users/:id/unfollow', requireLogin, followController.unfollow);

// ── Usuarios ──────────────────────────────────────
router.get('/users/:id', userController.show);
router.get('/interested', requireLogin, userController.interestedList);

// ── Mensajes ──────────────────────────────────────
router.get('/messages', requireLogin, userController.inbox);
router.get('/messages/:userId', requireLogin, userController.conversation);
router.post('/messages/:userId/send', requireLogin, userController.sendMessage);

// ── Notificaciones ────────────────────────────────
router.get('/notifications', requireLogin, notificationController.index);
router.post('/notifications/:id/read', requireLogin, notificationController.markRead);
router.post('/notifications/read-all', requireLogin, notificationController.markAllRead);

// ── Colecciones ───────────────────────────────────
router.get('/collections', requireLogin, collectionController.index);
router.post('/collections/create', requireLogin, collectionController.create);
router.post('/collections/:id/add/:postId', requireLogin, collectionController.addPost);
router.post('/collections/:id/remove/:postId', requireLogin, collectionController.removePost);
router.post('/collections/:id/delete', requireLogin, collectionController.delete);

module.exports = router;