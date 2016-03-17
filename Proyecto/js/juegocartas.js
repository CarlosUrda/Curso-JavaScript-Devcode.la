"use strict";

/**
 * Función para obtener un rango de valores. Similar a range de Python.
 *
 * @param ini Límite inicial del rango. > 0
 * @param fin Límite final (no incluído entre los valores). Opcional y > ini.
 * @param paso Paso a incrementar cada valor en el rango devuelto.
 * @return Array con valores desde 0 a ini-1 (en incrementos de paso) si sólo 
 * se pasa ini; o array con valores entre ini y fin-1 (en incrementos de paso) 
 * si se pasa también fin. Null si hay algún error.
 */
function range( ini, fin, paso=1)
{
    ini = parseInt( ini);
    paso = parseInt( paso);
    if (isNaN( ini) || isNaN( paso) || paso === 0) return null;

    if (fin === void 0)
    {        
        if (paso < 0 || ini < 0) return null;
        return Array(Math.ceil(ini/paso)).map( (v, i)=>i*paso);
    }

    let signo = Math.sign( paso);
    fin = parseInt( fin);
    if (isNaN( fin) || fin <= ini*signo) return null;

    return Array(Math.ceil( (fin-ini)/paso)).map( (v, i) => ini + i*paso);
} 


const MAX_DIM = 8;
var dimensiones = range( 2, MAX_DIM+1, 2);

/**
 * Limpiar el tablero de cartas.
 */
function limpiarTablero() 
{

}


/**
 * Inicializar el tablero de cartas.
 *
 * @param dimension Dimensión del tablero.
 * @return true si se inicializa correctamente; false si hay algún error.
 */
function crearTablero( dimension)
{
    let tablero = document.getElementById( "tablero");
    if (tablero === null) return false;
    let totalCartas = Math.pow( dimension, 2);
    let valores = range( 1, totalCartas/2 + 1);
    valores = valores.concat( valores);

    for (let i = 1; i <= totalCartas; ++i)
    {
        let carta = document.createElement( "span");
        if (carta === null) return false;
        carta.class = "carta";
        carta.id = "carta"+i;
        carta.name = "carta"+i;
        let k = parseInt( Math.random()*valores.length);
        carta.value = valores[k];
        valores.splice( k); 
        tablero.appendChild( carta);
    }

    return true;
}


/**
 * Al cargarse la página inicialmente, se crean los marcadores donde se van a 
 * guardar las estadísticas y también se crean las opciones de selección.
 */
window.load = function( evento) {
    let tabla = document.querySelector("#resultados > table");
    let selector = document.getElementById( "dimension");
    for (let i of dimensiones)
    {
        let fila = document.createElement( "tr");
        fila.innerHTML = 
            '<th>Dimensión ' + i + '</th>
             <td class="jugadas"></td>
             <td class="ganadas"></td>
             <td class="perdidas"></td>'
       //fila.id = "dimension" + i;
       //fila.class = "dimension";
       tabla.appendChild( fila);

       let opcion = document.createElement( "option");
       opcion.value = i;
       selector.appendChild( opcion);
    }

};


/**
 * Cuando se empieza una partida con la configuración elegida.
 */
var botonEmpezar = document.getElementById( "empezar");
botonEmpezar.onclick = function( evento) 
{
    let dimension = parseInt( document.getElementById( "dimension").value);
    if (isNaN( dimension.value) || dimension < 2 || dimension > MAX_DIM)
    {
        alert( "Valor incorrecto de dimensión");
        return;
    }

    let intentos = parseInt( document.getElementById( "intentos").value);    
    if (isNan( intentos.value) || intentos < 1)
    {
        alert( "Valor incorrecto de número de intentos");
        return;
    }

    limpiarTablero();
    if (!crearTablero( dimension))
    {
        alert( "Error al inicializar el tablero");
        return;
    }  
};


var botonReiniciar = document.getElementById( "reiniciar");
botonReiniciar.onclick = function( evento) 
{
    if (!confirm( "¿Deseas borrar todos los datos de resultados?")) return;
    
    // Se limpian las estadísticas
    [].forEach.call( document.querySelectorAll( "#resultados td"), 
                     x => x.textContent = 0)

    limpiarTablero();

}
