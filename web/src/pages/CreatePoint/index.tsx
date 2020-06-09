import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'
import { Link, useHistory } from 'react-router-dom'
import './styles.css'
import logo from '../../assets/logo.svg'
import { FiArrowLeft } from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet'
import Dropzone from '../../components/Dropzone'

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGE_UF_Response {
    sigla: string;
}

interface IBGE_City_Response {
    id: number,
    nome: string;
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState('0');
    const [cities, setCities] = useState<IBGE_City_Response[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, [])

    useEffect(() => {
        axios.get<IBGE_UF_Response[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)
            setUfs(ufInitials);
        })
    }, [])

    useEffect(() => {
        if (selectedUf !== '0') {
            axios.get<IBGE_City_Response[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
                const cities = response.data.map(city => ({"id": city.id, "nome": city.nome}));
                setCities(cities);
            })
        }
    }, [selectedUf])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setFormData({...formData, [event.target.name]: event.target.value })
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const { name, email ,whatsapp } = formData;
        const uf = selectedUf
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude',String(longitude));
        data.append('items', items.join(','));
        
        if (selectedFile)
            data.append('image', selectedFile);

        api.post('points', data).then(response => {
            history.push('/');
        })
        
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="E-coleta"></img>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile}></Dropzone>
                <fieldset>

                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={[-23.5629637,-46.8155989]} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {
                                    ufs.map(uf => {
                                        return <option key={uf} value={uf}>{uf}</option>
                                    })
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                                <option value="0">Selecione uma Cidade</option>
                                {
                                    cities.map(city => {
                                        return <option key={city.id} value={city.nome}>{city.nome}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                    {items.map(item => {
                            return (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleSelectItem(item.id)} 
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    <img src={item.image_url} alt={item.title}></img>
                                    <span>{item.title}</span>                            
                                </li>
                            )
                        })}
                    </ul>
                </fieldset>
                <button type="submit" >
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;