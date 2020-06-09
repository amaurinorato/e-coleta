import knex from '../database/connection'
import {Request, Response} from 'express';


class ItemController {

    async index(req: Request, resp: Response) {
        const items = await knex('item').select('*');
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.0.112:3333/uploads/${item.image}`
            }
        })

        return resp.json(serializedItems);
    }

}

export default ItemController;