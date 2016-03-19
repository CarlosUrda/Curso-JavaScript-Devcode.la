"use strict";

/**
 * Mejoras:
 */


import {range, ObjetoDOM, defPrivados} from 'utilidades';


/**
 * Clase Tablero donde están todas las cartas.
 */
var Tablero = (function()
{
    var priv = defPrivados();

    /**
     * Clase Carta
     */
    class Carta extends ObjetoDOM
    {
        /**
         * Contructor de carta.
         *
         * @param id Id a usar como objeto DOM.
         * @param name Name a usar como objeto DOM.
         * @param obj Objeto DOM relacionado con la carta. Por defecto span.
         */
        constructor( id, name, obj = document.createElement( "span"))
        {
            super( obj);
            this.DOM.classList.add( "carta", "abajo");
            this.DOM.id = id;
            this.DOM.name = name;
            this.DOM.style.display = "none";
            this.DOM.onclick = Carta.prototype.pulsar;
            let thisPrv = priv( this);
            thisPrv._bocaAbajo = true;
            thisPrv._visible = false;
            thisPrv._valor = null;  
        }

        /**
         * Propiedad para saber si la carta está boca abajo
         *
         * @return True si la carta está boca abajo. False si está boca arriba.
         */
        get estaHaciaAbajo()
        {
            return priv( this)._bocaAbajo;
        }

        /**
         * Propiedad para saber si la carta debe estar visible en el DOM.
         *
         * @return True/False si la carta debe estar visible o no en el DOM.
         */
        get esVisibleDOM()
        {
            return priv( this)._visible;
        }

        /**
         * Cambiar la visibilidad del objeto DOM asociado con la carta.
         *
         * @param flag True/False si se desea hacer o no visible.
         */
        set visibleDOM( flag)
        {
            let thisPrv = priv( this);
            thisPrv._visible = Boolean( flag);
            this.DOM.style.display = thisPrv._visible ? "inline" : "none";
        }

        /**
         * Obtener el valor de la carta.
         *
         * @return Valor de la carta.
         */
        get valor()
        {
            return priv( this)._valor;
        }


        /**
         * Dar la vuelta a la carta.
         */
        voltear()
        {
            let thisPrv = priv( this);
            thisPrv._bocaAbajo = !thisPrv._bocaAbajo;
        }


        /**
         */
        pulsar()
    }


    class _Tablero extends ObjetoDOM
    {    
        static get MAX_DIM() { return 8; }

        /**
         * Constructor.
         *
         * @param obj Objeto DOM asociado con el tablero.
         * @param dimension Dimensión máxima que puede tener el tablero (par).
         */
        constructor( obj, dimension)
        {
            if (dimension % 2 !== 0)
                throw new PersonalException( "La dimensión máxima no es par");

            super( obj);
            let thisPrv = priv( this);
            thisPrv._maxDimension = dimension;
            thisPrv._cartas = new Array( Math.pow( dimension, 2));

            for (let i in thisPrv._cartas)
            {   
                let id = "carta" + (i+1);
                thisPrv._cartas[i] = new Carta( id, id);
                this.DOM.appendChild( thisPrv._cartas[i].DOM);
            }
        }


        /**
         * Inicializa el tablero de cartas para empezar una nueva partida.
         *
         * @param dimension Dimensión del tablero para la partida a iniciar.
         */
        inicializaTablero( dimension)
        {
            if (dimension % 2 !== 0)
                throw new PersonalException( "La dimensión no es par", -2);
            if (dimension > thisPrv._maxDimension)
                throw new PersonalException( 
                        "Dimensión de la partida mayor al máximo permitido", -3);

            let thisPrv = priv( this);

            let totalCartas = Math.pow( dimension, 2);
            let valores = range( 1, totalCartas/2 + 1);
            valores = valores.concat( valores);

            let i = 0;
            for (let carta of thisPrv._cartas)
            {
                carta.classList.add( "abajo");
                carta.classList.remove( "arriba");
                if (i++ >= totalCartas)
                {
                    carta.style.display = "none";
                    continue;
                }

                let k = parseInt( Math.random()*valores.length);
                carta.value = valores[k];
                carta.style.display = "inline";
                valores.splice( k); 
           }

            tablero.style.width = Math.ceil( dimension * 100/MAX_DIM)+"%";
        }      


        /**
         * Destruir el tablero de cartas.
         */
        destruir() 
        {
            this.DOM.textContent = "";
            delete priv( this)._cartas;
        }
    }

    return _Tablero;
})();


class Partida 
{
}






/**
 * Inicializa las opciones de juego y las tablas de puntuación.
 */
function inicializarPantallaDeJuego()
{
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
}


var botonEmpezar,
    botonReiniciar,
    botonParar;
    jugando,
    tablero, 
    textIntentos,
    intentosPartida,
    intentosRestantes,
    valorIntentosRestantes;
    dimension,
    valorDimension,
    dimensiones;

const MAX_DIM = 8; // Tiene que ser un valor par.


/**
 * Cuando se empieza una partida con la configuración elegida.
 */
function pulsarBotonEmpezar( evento) 
{
    valorDimension = parseInt( dimension.value);
    if (isNaN( valorDimension) || valorDimension < 2 || 
        valorDimension > MAX_DIM)
    {
        alert( "Valor incorrecto de dimensión");
        return;
    }

    valorIntentos = parseInt( intentos.value);    
    if (isNan( valorIntentos) || valorIntentos < 1)
    {
        alert( "Valor incorrecto de número de intentos");
        return;
    }

    inicializaTablero( valorDimension);

    botonEmpezar.disabled = true;
    botonParar.disabled = false;
    jugando = true;
    valorIntentosRestantes = valorIntentos;
    intentosRestantes.textContent = valorIntentosRestantes;
};


/**
 * Cuando se reinician los datos de los resultados.
 */
function pulsarBotonReiniciar( evento) 
{
    if (!confirm( "¿Deseas borrar todos los datos de resultados?")) return;
    
    // Se limpian las estadísticas
    [].forEach.call( document.querySelectorAll( "#resultados td"), 
                     x => x.textContent = 0)
}


/**
 * Cuando se para una partida empezada.
 */
function pulsarBotonParar( evento)
{
    botonEmpezar.disabled = false;
    botonParar.disabled = true;
    jugando = false;
}


/**
 * Al cargarse la página inicialmente, se crean los marcadores donde se van a 
 * guardar las estadísticas y también se crean las opciones de selección.
 */
window.load = function( evento) 
{
    botonEmpezar = document.getElementById( "empezar");
    botonEmpezar.onclick = pulsarBotonEmpezar;
    botonReiniciar = document.getElementById( "reiniciar");
    botonReiniciar.onclick = pulsarBotonReiniciar;
    botonParar = document.getElementById( "parar");
    botonParar.onclick = pulsarBotonParar;
    dimension = document.getElementById( "dimension");   
    intentos = document.getElementById( "intentos");
    intentosRestantes = document.getElementById( "intentos-restantes");   
    tablero = document.getElementById( "tablero");
    jugando = false;
    dimensiones = range( 2, MAX_DIM+1, 2);
 
    inicializarPantallaDeJuego(); 
    crearTablero();
};



