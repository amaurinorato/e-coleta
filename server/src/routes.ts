import express from 'express'
import PointController from './controllers/PointController'
import ItemController from './controllers/ItemController'
import multer from 'multer';
import multerConfig from './config/multer'

const upload = multer(multerConfig);

const pointController = new PointController();
const itemController = new ItemController();
const routes = express.Router();


routes.get('/items', itemController.index)
routes.get('/points', pointController.index)
routes.get('/points/:id', pointController.show)

routes.post('/points', upload.single('image'), pointController.create)

export default routes;