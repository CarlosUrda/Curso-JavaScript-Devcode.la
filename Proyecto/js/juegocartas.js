"use strict";

/**
 * Mejoras:
 * - Quizás es mejor crear el tablero cada vez con únicamente las cartas que set
 *   vayan a usar en lugar de tener un tablero creado siempre con el máximo 
 *   posible de cartas e ir ocultando o no dependiendo de la partida.
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
    class _Carta extends ObjetoDOM
    {
        /**
         * Contructor de carta.
         *
         * @param tablero Tablero al cual pertenece la carta.
         * @param id Id a usar como objeto DOM.
         * @param name Name a usar como objeto DOM.
         * @param obj Objeto DOM relacionado con la carta. Por defecto span.
         */
        constructor( tablero, id, name, obj = document.createElement( "span"))
        {
            super( obj);
            this.DOM.classList.add( "carta");
            this.DOM.id = id;
            this.DOM.name = name;
            this.DOM.style.display = "none";
            this.DOM.style.width = Math.ceil( 100/tablero.maxDimension)+"%";
            this.DOM.addEventListener( "click",
                    _Carta.prototype.pulsar.bind( this), false);
            this.ponerHaciaAbajo();

            let thisPrv = priv( this);
            thisPrv._enPartida = false;
            thisPrv._valor = null; 
            thisPrv._tablero = tablero;
        }

        /**
         * Propiedad para saber si la carta está boca abajo
         *
         * @return True si la carta está boca abajo. False si está boca arriba.
         */
        get estaHaciaAbajo()
        {
            return priv( this)._estaHaciaAbajo;
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
         * Cambiar el valor de la carta.
         */
        set valor( v)
        {
            let thisPrv = priv( this)._valor;

        }


        /**
         * Indicar si la carta está incluida dentro de la partida.
         *
         * @param valor Boolean que indica si está o no la carta en la partida.
         */
        set enPartida( valor)
        {
            priv( this)._enPartida = Boolean( valor);
        }


        /**
         * Colocar una carta mirando boca abajo.
         */
        ponerHaciaAbajo()
        {
            this.DOM.classList.remove( "arriba");
            this.DOM.classList.add( "abajo");
            priv( this)._estaHaciaAbajo = true;
        }

        /**
         * Colocar una carta mirando boca arriba.
         */
        ponerHaciaArriba()
        {
            this.DOM.classList.remove( "abajo");
            this.DOM.classList.add( "arriba");
            priv( this)._estaHaciaAbajo = false;
        }

        /**
         * Dar la vuelta a la carta.
         */
        voltear()
        {
            this.DOM.classList.toggle( "abajo");
            this.DOM.classList.toggle( "arriba");
            let thisPrv = priv( this);
            thisPrv._estaHaciaAbajo = !thisPrv._estaHaciaAbajo;
        }


        /**
         * Manejador que se ejecutará cuando se pinche sobre la carta.
         */
        pulsar()
        {            
            let thisPrv = priv( this);
            if (!this.estaHaciaAbajo() || !thisPrv._tablero.elegirCarta( this))
            {
                stopPropagation();
                return;
            }

            this.voltear();            
        }
    }


    class _Tablero extends ObjetoDOM
    {    
        static get MAX_DIM() { return 8; }

        /**
         * Constructor.
         *
         * @param obj Objeto DOM asociado con el tablero.
         * @param dimension Dimensión máxima que puede tener el tablero (par).
         * @param partida Partida en la cual va a participar el tablero.
         */
        constructor( obj, maxDimension, partida = null)
        {
            if (maxDimension % 2 !== 0)
                throw new PersonalException( "La dimensión máxima no es par");
            if (dimension % 2 !== 0)
                throw new PersonalException( "La dimensión inicial no es par");

            super( obj);
            this.DOM.addEventListener( "click",                    
                    _Tablero.prototype.pulsar.bind( this), false);
            let thisPrv = priv( this);
            thisPrv._maxDimension = maxDimension;
            thisPrv._cartas = new Array( Math.pow( maxDimension, 2));
            thisPrv._cartasElegidas = new Array( 0);

            for (let i in thisPrv._cartas)
            {   
                let id = "carta" + (i+1);
                thisPrv._cartas[i] = new Carta( this, id, id);
                this.DOM.appendChild( thisPrv._cartas[i].DOM);
            }

            if (partida)
                this.inicializar( partida);
            
            thisPrv._partida = partida;
        }

        /**
         * Obtener la máxima dimensión asignada al crear el tablero.
         *
         * @return Máxima dimensión asignada.
         */
        get maxDimension()
        {
            return priv( this)._maxDimension;
        }


        /**
         * Inicializa el tablero de cartas para empezar una nueva partida.
         *
         * @param partida Partida en la cual va a participar el Tablero.      
         */
        inicializar( partida)
        {
            if (partida.dimension % partida.emparejados !== 0)
                throw new PersonalException( 
                        "Dimensión no válida para valor de emparejamiento", -2);
            if (partida.dimension > thisPrv._maxDimension)
                throw new PersonalException( 
                        "Dimensión de partida mayor al máximo permitido", -3);

            let thisPrv = priv( this);
            thisPrv._partida = partida;

            let totalCartas = Math.pow( partida.dimension, 2);
            let _valores = range( 1, totalCartas/partida.emparejados + 1);
            let valores = [];
            for (let i = 0; i < partida.emparejados; ++i)
                valores = valores.concat( _valores);

            let i = 0;
            for (let carta of thisPrv._cartas)
            {
                if (++i > totalCartas)
                {
                    carta.DOM.style.display = "none";
                    carta.enPartida = false;
                    carta.valor = null;
                    continue;
                }

                carta.ponerHaciaAbajo();
                let k = parseInt( Math.random()*valores.length);
                carta.valor = valores[k];
                carta.DOM.style.display = "inline";
                carta.enPartida = true;
                valores.splice( k); 
            }

            this.DOM.style.width = Math.ceil( 
                    dimension * 100/thisPrv._maxDimension)+"%";
        }      


        /**
         * Manejador que se ejecutará cuando se pinche sobre alguna carta del
         * tablero
         */
        pulsar()
        {
            let thisPrv = priv( this);
            if (thisPrv._cartasElegidas.length < thisPrv._partida.emparejados)
                return;

            if (!thisPrv._cartasElegidas.slice( 1).every( 
                        c => c.valor === thisPrv._cartasElegidas[0].valor))
            {
                thisPrv._cartasElegidas.forEach( c => c.ponerHaciaAbajo());
            }

            thisPrv._cartasElegidas = new Array(0);

            thisPrv._partida.intento++;
            thisPrv._partida.comprobarFinal();
        }


        /**
         * Comprueba si el tablero está en una victoria: todas las cartas 
         * hacia arriba al haber sido emparejadas.
         */
        esVictoria()
        {
            return priv( this)._cartas
        }
        

        /**
         * Método que añade una carta como escogida para emparejar con otras
         * ya elegidas.
         *
         * @param carta Carta seleccionada.
         * @return True/False si la carta es considerada para realizar la 
         * comprobación de emparejamiento con otras cartas elegidas.
         */
        elegirCarta( carta)
        {
            let thisPrv = priv( this);
            if (thisPrv._cartasElegidas.lentgth >= thisPrv._partida.emparejados)
                return false;

            thisPrv._cartasElegidas.push( carta);
            return true;        
        }


        /**
         * Destruir el tablero de cartas.
         */
        destruir() 
        {
            this.DOM.innerHTML = "";
            let thisPrv = priv( this);
            delete thisPrv._cartas;
            thisPrv._partida = null;
        }
    }

    return _Tablero;
})();


/**
 * Clase Partida.
 */
var Partida = (function() 
{
    var priv = defPrivados();

    class _Configuracion extends ObjetoDOM
    {
        /**
         * Constructor.
         *
         * @param obj Objeto DOM donde se encuentran las opciones de
         * configuración.
         */
        constructor( obj)
        {
            super( obj);
            this.DOM.getElementById( "empezar").onclick = 
                _Configuracion.prototype.pulsarEmpezar();
            this.DOM.getElementById( "parar").onclick = 
                _Configuracion.prototype.pulsarParar();
            this.DOM.getElementById( "reiniciar").onclick = 
                _Configuracion.prototype.pulsarReiniciar();

        }

        /**
         * Manejador para cuando se pulsa el botón de empezar partida.
         */
        pulsarEmpezar()
        {
        }

        /**
         * Manejador para cuando se pulsa el botón de parar partida actual.
         */
        pulsarParar()
        {
        }


        /**
         * Manejador para cuando se pulsa el botón reiniciar datos de las 
         * estadísticas.
         */
        pulsarReiniciar()
        {
        }

    }

    class _Estadisticas extends ObjetoDOM
    {
    }


    class _Partida 
    {
        /**
         * Constructor.
         */
        constructor( tablero, dimension, maxIntentos)
        {
            if (dimension > tablero.maxDimension)
                throw new PersonalException( 
                        "Dimensión de partida mayor a la máxima del tablero");

            let thisPrv = priv( this);
            thisPrv._intento = 0;
            thisPrv._maxIntentos = maxIntentos;
            thisPrv._tablero = tablero;
            thisPrv._dimension = dimension;
            tablero.inicializar( this)
        }

        set intento( valor)
        {
       // Al cambiar el número de intentos cambiarlo por pantalla.
      //

           priv( this)._intento = Number( valor);
        }

        /**
         * Comprobar si la partida ha finalizado actuando en consecuencia.
         */
        comprobarFinal()
        {
        }
    }

    return _Partida;
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



