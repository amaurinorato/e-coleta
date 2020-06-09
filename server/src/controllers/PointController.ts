import knex from '../database/connection'
import {Request, Response, response} from 'express';

class PointsController {

    async create(req: Request, resp: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };
    
        const trx = await knex.transaction();
    
        const result = await trx('point').insert(point);
    
        const point_id = result[0];
    
        const pointItems = items
            .split(',')
            .map((item: String) => {return Number(item.trim())})
            .map((item_id: number) => {
                return {item_id, point_id}
            })
    
        await trx('point_item').insert(pointItems);

        await trx.commit();

        return resp.json({point_id, ...point, items});
    }

    async show(req: Request, resp: Response) {
        const {id} = req.params;

        const point = await knex('point').select('*').where('id', id ).first();

        if (!point) {
            return resp.status(404).send({message: 'Point not found'})
        }

        const items = await knex('item').join('point_item', 'item.id', '=', 'point_item.item_id').where('point_item.point_id', id).select('title');

        const serializedPoint =  {
            ...point,
            image_url: `http://192.168.0.112:3333/uploads/${point.image}`
        }

        return resp.json({serializedPoint, items});
    }

    async index(req: Request, resp: Response) {
        const {city, uf, items} = req.query;

        console.log(city, uf, items);
        
        
        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        console.log(parsedItems);

        const points = await knex('point')
                            .join('point_item', 'point.id', '=', 'point_item.point_id')
                            .whereIn('point_item.item_id', parsedItems)
                            .where('uf', String(uf))
                            .where('city', String(city))
                            .distinct()
                            .select('point.*')

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.112:3333/uploads/${point.image}`
            }
        })    

        return resp.json(serializedPoints);
    }
}

export default PointsController;