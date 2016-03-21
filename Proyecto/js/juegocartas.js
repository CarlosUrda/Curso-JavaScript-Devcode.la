"use strict";

/**
 * Mejoras:
 * - Que en las estadísticas cuente también el emparejamiento.
 */


import {range, divisibles, ObjetoDOM, defPrivados} from 'utilidades';


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
            this.DOM.style.width = Math.ceil( 100/tablero.maxDimension)+"%";
            this.DOM.addEventListener( "click",
                    _Carta.prototype.pulsar.bind( this), false);
            this.ponerHaciaAbajo();

            let thisPrv = priv( this);
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
            if (this.estaHaciaArriba) this.ponerHaciaArriba();
        }


        /**
         * Colocar una carta mirando boca abajo.
         */
        ponerHaciaAbajo()
        {
            this.DOM.classList.remove( "arriba");
            this.DOM.classList.add( "abajo");
            priv( this)._estaHaciaAbajo = true;
            // Mostrar en el DOM la parte de abajo.
        }

        /**
         * Colocar una carta mirando boca arriba.
         */
        ponerHaciaArriba()
        {
            this.DOM.classList.remove( "abajo");
            this.DOM.classList.add( "arriba");
            priv( this)._estaHaciaAbajo = false;
            // Mostrar en el DOM la parte de arriba
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
            if (!this.estaHaciaAbajo() || !thisPrv._tablero.emparejarCarta(this))
            {
                stopPropagation();
                return;
            }

            this.voltear();            
        }
    }


    class _Tablero extends ObjetoDOM
    {    
        static get MAX_DIMENSION() { return 8; }

        /**
         * Constructor.
         *
         * @param obj Objeto DOM asociado con el tablero.
         * @param partida Partida en la cual va a participar el tablero.
         */
        constructor( obj, partida)
        {
            super( obj);
            this.DOM.addEventListener( "click",                    
                    _Tablero.prototype.pulsar.bind( this), false);
            priv( this)._partida = partida;
            this.construir();            
        }


        /**
         * Construye un tablero de cartas inicializándolo para empezar una 
         * nueva partida.
         */
        construir()
        {
            this.DOM.innerHTML = "";
            let thisPrv = priv( this);
            let totalCartas = Math.pow( thisPrv._partida.dimension, 2);
            thisPrv._cartas = new Array( totalCartas);
            let _valores = range( 1, totalCartas/partida.emparejados + 1);
            let valores = [];
            for (let i = 0; i < partida.emparejados; ++i)
                valores = valores.concat( _valores);

            for (let i in thisPrv._cartas)
            {   
                let id = "carta" + (i+1);
                carta = new Carta( this, id, id);
                carta.ponerHaciaAbajo();
                let k = parseInt( Math.random()*valores.length);
                carta.valor = valores[k];
                valores.splice( k); 
                this.DOM.appendChild( carta.DOM);
                thisPrv._cartas[i] = carta;
            }

            thisPrv._cartasAEmparejar = new Array( 0); 
            this.DOM.style.width = Math.ceil(
                    dimension * 100/thisPrv._maxDimension)+"%";
        }      


        /**
         * Manejador que se ejecutará cuando se pinche sobre alguna carta del
         * tablero. Comprueba si las cartas que se están emparejando coinciden
         * o no para dejarlas boca arriba o volveras boca abajo.
         */
        pulsar()
        {
            let thisPrv = priv( this);
            if (thisPrv._cartasAEmparejar.length < thisPrv._partida.emparejados)
                return;

            if (!thisPrv._cartasAEmparejar.slice( 1).every( 
                        c => c.valor === thisPrv._cartasAEmparejar[0].valor))
            {
                thisPrv._cartasAEmparejar.forEach( c => c.ponerHaciaAbajo());
            }

            thisPrv._cartasAEmparejar = new Array(0);
            thisPrv._partida.gastarIntento();
        }


        /**
         * Comprueba si el tablero está en una victoria: todas las cartas 
         * hacia arriba al haber sido emparejadas.
         */
        esVictoria()
        {
            return priv( this)._cartas.every( c => c.estaHaciaArriba());
        }
        

        /**
         * Método que añade una carta como escogida para emparejar con otras
         * ya elegidas anteriormente.
         *
         * @param carta Carta seleccionada.
         * @return True/False si la carta es considerada para realizar la 
         * comprobación de emparejamiento con otras cartas ya elegidas.
         */
        emparejarCarta( carta)
        {
            let thisPrv = priv( this);
            if (thisPrv._cartasAEmparejar.length >= thisPrv._partida.emparejados)
                return false;

            thisPrv._cartasAEmparejar.push( carta);
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
        constructor( obj, juego)
        {
            super( obj);
            this.DOM.getElementById( "empezar").onclick = 
                _Configuracion.prototype.pulsarEmpezar.bind( this);
            this.DOM.getElementById( "parar").onclick = 
                _Configuracion.prototype.pulsarParar.bind( this);
            this.DOM.getElementById( "reiniciar").onclick = 
                _Configuracion.prototype.pulsarReiniciar.bind( this);
            this.DOM.getElementById( "reiniciar").onclick = 
                _Configuracion.prototype.pulsarReiniciar.bind( this);

            let thisPrv = priv( this);
            thisPrv._juego = juego;

            let select = this.DOM.getElementById( "dimension");
            for (let i = 2; i <= _Tablero.MAX_DIMENSION(); ++i)
            {
                let opcion = document.createElement( "option");
                opcion.value = i;
                opcion.textContent = i;
                select.appendChild( opcion);
            }

            select = this.DOM.getElementById( "emparejados");
            for (let i of divisibles( Tablero.MAX_DIMENSION()))
            {
                let opcion = document.createElement( "option");
                opcion.value = i;
                opcion.textContent = i;
                select.appendChild( opcion);
            }

       }

        /**
         * Manejador para cuando se pulsa el botón de empezar partida.
         */
        pulsarEmpezar()
        {
            let thisPrv;
            thisPrv._juego.guardarPartida();
            
            // Se crea una nueva partida.
            
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

    /**
     * Clase Estadísticas donde se guardan los datos con los resultados de 
     * todas las partidas realizadas.
     *
     * Mejoras: 
     * - Que cuente también el número asignado para emparejar.
     */
    class _Estadisticas extends ObjetoDOM
    {
        /**
         * Constructor de Estadísticas.
         *
         * @param obj Objeto DOM asociado con las estadísticas.
         * @param juego Objeto representando al Juego en sí.
         */
        constructor( obj, juego)
        {
            super( obj);
            let thisPrv = priv( this);
            thisPrv._juego = juego;
            thisPrv._datos = {"total": {"total": 0, "victoria": 0, "derrota": 0}};

            // Se construye la estructura en el DOM.
            let tabla = this.DOM.getElementByTagName( "table");
            let fila = document.createElement( "tr");
            fila.dataset.tipo = "total";
            fila.innerHTML = 
                '<th>Total</th>
                 <td class="total" data-res="total">0</td>
                 <td class="victoria" data-res="victoria">0</td>
                 <td class="derrota" data-res="derrota">0</td>'
            tabla.appendChild( fila);

            for (let i = 2; i <= _Tablero.MAX_DIMENSION(); ++i)
            {
                thisPrv._datos["dim"+i] = {"total":0, "victoria":0, "derrota":0};
                fila = document.createElement( "tr");
                fila.dataset.tipo = "dim"+i;
                fila.innerHTML = 
                    '<th>Dimensión ' + i + '</th>
                     <td class="total" data-res="total">0</td>
                     <td class="victoria" data-res="victoria">0</td>
                     <td class="derrota" data-res="derrota">0</td>'
                tabla.appendChild( fila);
            }

            this.DOM.getElementById( "reiniciar").onclick = 
                _Estadisticas.prototype.inicializar.bind( this);
            this.DOM.getElementById( "refrescar").onclick = 
                _Estadisticas.prototype.refrescar.bind( this);
       }


        /**
         * Se inicializan todos los datos de las estadísticas de las partidas 
         * jugadas.
         */
        inicializar()
        {
            if (!confirm( "¿Deseas borrar todos los datos de estadísticas?")) 
                return;
               
            let thisPrv = priv( this);
            thisPrv._datos = {"total": {"total": 0, "victoria": 0, "derrota": 0}};
            for (let i = 2; i <= _Tablero.MAX_DIMENSION(); ++i)
            {
                thisPrv._datos["dim"+i] = {"total":0, "victoria":0, "derrota":0};
            }
 
            refrescar();
        }

        /**
         * Aumentar en las estadísticas una nueva victoria o derrota.
         *
         * @param final Tipo de partida finalizada: "victoria" o "derrota".
         * @param dimension Dimensión de la partida finalizada.
         */
        puntuar( final, dimension)
        {
            if (final !== "victoria" || final !== "derrota")
                throw new PersonalException( "Argumento final incorrecto");
            if (dimension < 2 || dimension > _Tablero.MAX_DIMENSION())
                throw new PersonalException( "Argumento dimension incorrecto.");

            let thisPrv = priv( this);
            thisPrv._datos.total.total++;
            thisPrv._datos.total[final]++
            thisPrv._datos["dim"+dimension].total++;
            thisPrv._datos["dim"+dimension][final]++;

            refrescar();
        }


        /**
         * Refrescar los datos de las estadísticas en pantalla
         */
        refrescar()
        {
            let thisPrv = priv( this);

            for (let tr of this.DOM.getElementsByTagName( "tr"))
            {
                [].forEach.call( tr.getElementsByTagName( "td"), 
                        td => td.textContent = 
                              thisPrv._datos[tr.dataset.tipo][td.dataset.res];);
            }
        }
    }


    class _Juego
    {
        /**
         * Constructor de Juego.
         */
        constructor()
        {
            let thisPrv = priv( this);
            thisPrv._configuracion = new _Configuracion( 
                    document.getElementById( "configuracion"), this);
            thisPrv._estadisticas = 
                new _Estadisticas( document.getElementById( "estadisticas"));
            thisPrv._partidasAnteriores = {};
            thisPrv._partida = null;
        }


        /**
         * Finalizar y almacenar la partida actual en la lista de partidas 
         * finalizadas.
         */
        guardarPartida()
        {            
            let thisPrv = priv( this);
            if (thisPrv._partida === null) return;

            thisPrv._partidasAnteriores[thisPrv._partida.id] = thisPrv._partida;
            thisPrv._partida = null;
        }

    }


    var id = 1; // Id a ir asignando a cada partida.

    class _Partida extends ObjetoDOM
    {
        /**
         * Constructor de Partida..
         *
         * @param obj Objeto DOM donde se encuentran los detalles de la partida.
         * @param dimension Dimension del tablero.
         * @param emparejados Número de cartas a emparejar en cada intento.
         * @param maxIntentos Máximo número de intentos disponibles.
         */
        constructor( obj, dimension, emparejados, maxIntentos)
        {
            if (dimension < 2 || dimension > _Tablero.MAX_DIMENSION)
                throw new PersonalException( "Valor de Dimensión erróneo.");
            if (emparejados < 2 || emparejados > dimension)
                throw new PersonalException( "Valor erróneo de emparejados");
            if (dimension % emparejados !== 0)
                throw new PersonalException( 
                        "Dimensión no válida para valor de emparejamiento");
            if (maxIntentos < 1)
                throw new PersonalException( "Valor erróneo de maxIntentos");

            super( obj);
            let thisPrv = priv( this);
            thisPrv._intentos = 0;
            thisPrv._maxIntentos = maxIntentos;
            thisPrv._tablero = new Tablero( 
                    this.DOM.getElementById( "tablero"), this);
            thisPrv._dimension = dimension;
            thisPrv._emparejados = emparejados;
            thisPrv._id = "" + id++;
        }

        /**
         * Atributo getter para obtener el valor de id.
         */
        get id()
        {
            return priv( this)._id;
        }

        /**
         * Se incrementa el número de intentos y se muestra el cambio.
         */
        inc incIntentos()
        {
            let thisPrv = priv( this);
            let restantes = thisPrv._maxIntentos - ++thisPrv._intentos;
            this.DOM.getElementById("intentos").textContent = restantes;
        }

        /**
         * Modificar el mensaje del resultado de la partida.
         *
         * @param mensaje Mensaje a mostrar como resultado de la partida.
         */
        set resultado( mensaje)
        {
            priv( this).DOM.getElementById( "resultado").textContent = mensaje;
        }

        /**
         * Gastar un intento de los disponibles y comprobar si la partida ha 
         * finalizado por victoria o por gasto de todos los intentos.
         */
        gastarIntento()
        {
            this.incIntentos();

            if (thisPrv._tablero.esVictoria())
            {
                this.resultado = "¡¡¡GANASTE!!!";
                return;
            }

            if (restantes == 0)
            {
                this.resultado = "HAS PERDIDO GAÑÁN";
            }
        }
    }

    return _Partida;
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



