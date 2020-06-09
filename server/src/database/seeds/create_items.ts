import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('item').insert([
        {title: 'lampadas', image: 'lampadas.svg'},
        {title: 'pilhas e baterias', image: 'baterias.svg'},
        {title: 'Papéis e papelão', image: 'papeis-papelao.svg'},
        {title: 'Resíduos eletrônicos', image: 'eletronicos.svg'},
        {title: 'Resíduos Orgânicos', image: 'organicos.svg'},
        {title: 'Óleo de cozinha', image: 'oleo.svg'},
    ]);
}