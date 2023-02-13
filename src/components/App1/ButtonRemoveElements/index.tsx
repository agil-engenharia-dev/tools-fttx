import style from './style.module.css'

interface props{
    removeElementsInPolygon:()=>void
}

export function ButtonRemoveElements({removeElementsInPolygon}:props){
    return(
    <button onClick={removeElementsInPolygon}title='Remover Elementos' className={`${style.button} leaflet-control-layers leaflet-control`}>
        <img className={`${style.img}`} src='https://cdn.icon-icons.com/icons2/936/PNG/512/remove-button_icon-icons.com_73440.png'/>
    </button>
    )
}
