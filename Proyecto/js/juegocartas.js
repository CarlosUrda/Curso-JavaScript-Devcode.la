"use strict";

/**
 * Mejoras:
 * - Que en las estadísticas cuente también el emparejamiento.
 * - Los objetos DOM se suelen comprobar solamente al crear los objetos. Podría 
 *   mejorarse si se hace una comprobación exhaustiva cada vez que se vaya a
 *   usar y si no existe, crearlo de nuevo. Aunque es posible que sea un poco 
 *   exagerado y con simplemente comprobar que existen al instanciar los objetos
 *   como ahora, sea suficiente.
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
         * Contructor de carta. Inicialmente la carta se sitúa hacia abajo.
         *
         * @param tablero Tablero al cual pertenece la carta.
         * @param id Id a usar como objeto DOM.
         * @param name Name a usar como objeto DOM.
         * @param valor Valor de la carta.
         * @param obj Objeto DOM relacionado con la carta. Por defecto span.
         */
        constructor( tablero, id, name, valor, 
                     obj = document.createElement( "span"))
        {
            super( obj);
            this.DOM.classList.add( "carta");
            this.DOM.id = id;
            this.DOM.name = name;
            this.DOM.style.width = Math.ceil( 100/Tablero.MAX_DIMENSION)+"%";
            this.DOM.addEventListener( "click",
                    _Carta.prototype.pulsar.bind( this), false);
            this.ponerHaciaAbajo();

            let thisPrv = priv( this);
            thisPrv._valor = valor; 
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
            if (thisPrv._tablero.bloqueado || !this.estaHaciaAbajo() || 
                !thisPrv._tablero.emparejarCarta( this))
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
                                       _Tablero.prototype.pulsar.bind( this), 
                                       false);
            let thisPrv = priv( this);
            thisPrv._partida = partida;
            thisPrv._bloqueado = false;
            this.construir();            
        }

        /**
         * Comprueba si todas las cartas del tablero están mirando hacia arriba.
         *
         * @return True/False dependiendo si todas las cartas miran arriba.
         */
        get estanCartasArriba()
        {
            return priv( this)._cartas.every( c => c.estaHaciaArriba());
        }
        

        /**
         * Atributo para saber si el tablero está bloqueado y no se puede 
         * interactuar con él.
         *
         * @return True/False dependiendo si el tablero está bloqueado o no.
         */
        get bloqueado()
        {
            return priv( this)._bloqueado;
        }


        /**
         * Construye un tablero de cartas inicializándolo para empezar una 
         * nueva partida.
         */
        construir()
        {
            let thisPrv = priv( this);

            let totalCartas = Math.pow( thisPrv._partida.dimension, 2);
            thisPrv._cartas = new Array( totalCartas);

            let _valores = range(1, totalCartas/thisPrv._partida.emparejados+1);
            let valores = [];
            for (let i = 0; i < thisPrv._partida.emparejados; ++i)
                valores = valores.concat( _valores);

            for (let i in thisPrv._cartas)
            {   
                let id = "carta" + (i+1);
                let k = parseInt( Math.random()*valores.length);
                thisPrv._cartas[i] = new Carta( this, id, id, valores[k]);
                valores.splice( k); 
                this.DOM.appendChild( thisPrv._cartas[i].DOM);
            }

            thisPrv._cartasAEmparejar = new Array( 0); 
            this.DOM.style.width = Math.ceil(
                    thisPrv._partida.dimension * 100/_Tablero.MAX_DIMENSION)+"%";
        }      


        /**
         * Manejador que se ejecutará cuando se pinche sobre alguna carta del
         * tablero. Comprueba si las cartas que se están emparejando coinciden
         * o no para dejarlas boca arriba o volveras boca abajo.
         */
        pulsar()
        {
            let thisPrv = priv( this);
            if (thisPrv.bloqueado || 
                thisPrv._cartasAEmparejar.length < thisPrv._partida.emparejados)
                return;

            if (!thisPrv._cartasAEmparejar.slice( 1).every( 
                        c => c.valor === thisPrv._cartasAEmparejar[0].valor))
            {
                thisPrv._cartasAEmparejar.forEach( c => c.ponerHaciaAbajo());
            }

            thisPrv._cartasAEmparejar = new Array(0);
            thisPrv._bloqueado = thisPrv._partida.gastarIntento();
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
         * Constructor de Configuracion.
         *
         * @param obj Objeto DOM donde se encuentran las opciones de
         * configuración.
         * @param juego Juego al cual pertenece toda la configuración.
         * @throws ObjetoDOMException Si hay algún problema con los Objetos DOM.
         * @throws ArgumentosException si los argumentos son erróneos.
         */
        constructor( obj, juego)
        {
            super( obj);
            if (!juego)
                throw new ArgumentosException( ArgumentosException.ERR_VACIO,
                                               "Configuracion.constructor",
                                               ["juego", juego]);
            let thisPrv = priv( this);

            // Comprobación de la existencia de los objetos DOM.
            thisPrv._botonEmpezar = this.DOM.getElementById( "empezar");
            if (thisPrv._botonEmpezar === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Configuracion()", "id=empezar");
            thisPrv._botonParar = this.DOM.getElementById( "parar");
            if (thisPrv._botonParar === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Configuracion()", "id=parar");
            thisPrv._selectDimension = this.DOM.getElementById( "dimension"); 
            if (thisPrv._selectDimension === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Configuracion()", "id=dimension");
            thisPrv._selectEmparejados = this.DOM.getElementById( "emparejados");
            if (thisPrv._selectEmparejados === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Configuracion()", "id=emparejados");
           
            thisPrv._botonEmpezar.onclick = 
                _Configuracion.prototype.pulsarEmpezar.bind( this);
            thisPrv._botonParar.onclick = 
                _Configuracion.prototype.pulsarParar.bind( this);
            thisPrv._selectDimension.onchange = 
                _Configuracion.prototype.seleccionarDimension.bind( this);

            thisPrv._juego = juego;

            for (let i = 2; i <= _Tablero.MAX_DIMENSION(); ++i)
            {
                let opcion = document.createElement( "option");
                opcion.value = i;
                opcion.textContent = i;
                thisPrv._selectDimension.appendChild( opcion);
            }

        }


        /**
         * Manejador para cuando se pulsa el botón de empezar partida.
         */
        pulsarEmpezar()
        {
            let thisPrv = priv( this);

            thisPrv._juego.crearPartida();
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


        /**
         * Manejador a ejecutar cada vez se selecciona una dimensión.
         */
        seleccionarDimension( evento)
        {
            let thisPrv = priv( this);
            thisPrv._selectEmparejados.innerHTML = "";

            for (let i of divisibles( evento.target.value))
            {
                let opcion = document.createElement( "option");
                opcion.value = i;
                opcion.textContent = i;
                thisPrv._selectEmparejados.appendChild( opcion);
            }
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
         * @throws ObjetoDOMException si hay error con el DOM.
         * @throws ArgumentosException si los argumentos son erróneos.
         */
        constructor( obj, juego)
        {
            super( obj);
            if (!juego)
                throw new ArgumentosException( ArgumentosException.ERR_VACIO,
                                               "Estadisticas.constructor", 
                                               ["juego", juego]);
            let thisPrv = priv( this);
            thisPrv._juego = juego;
            thisPrv._datos = {total: {total: 0, victoria: 0, derrota: 0}};

            // Se construye la estructura en el DOM.
            thisPrv._tabla = this.DOM.querySelector( "table");
            if (thisPrv._tabla === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE_,
                                              "Estadisticas.constructor",
                                              this.DOM.tagName + " table");

            let fila = document.createElement( "tr");
            fila.dataset.tipo = "total";
            fila.innerHTML = 
                `<th>Total</th>
                 <td class="total" data-res="total">0</td>
                 <td class="victoria" data-res="victoria">0</td>
                 <td class="derrota" data-res="derrota">0</td>`
            thisPrv._tabla.appendChild( fila);

            for (let i = 2; i <= _Tablero.MAX_DIMENSION(); ++i)
            {
                thisPrv._datos["dim"+i] = {total: 0, victoria: 0, derrota: 0};
                fila = document.createElement( "tr");
                fila.dataset.tipo = "dim"+i;
                fila.innerHTML = 
                    `<th>Dimensión ${i}</th>
                     <td class="total" data-res="total">0</td>
                     <td class="victoria" data-res="victoria">0</td>
                     <td class="derrota" data-res="derrota">0</td>`
                thisPrv._tabla.appendChild( fila);
            }

            thisPrv._botonReiniciar = this.DOM.getElementById( "reiniciar");
            if (thisPrv._botonReiniciar === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Estadisticas()", "id=reiniciar");
            thisPrv._botonRefrescar = this.DOM.getElementById( "refrescar");
            if (thisPrv._botonRefrescar === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Estadisticas()", "id=refrescar");
            thisPrv._botonReiniciar.onclick = 
                _Estadisticas.prototype.reiniciar.bind( this);
            thisPrv._botonRefrescar.onclick = 
                _Estadisticas.prototype.refrescar.bind( this);
        }


        /**
         * Se inicializan todos los datos de las estadísticas de las partidas 
         * jugadas.
         */
        reiniciar()
        {
            if (!confirm( "¿Deseas borrar todos los datos de estadísticas?")) 
                return;
               
            let thisPrv = priv( this);
            thisPrv._datos = {total: {total: 0, victoria: 0, derrota: 0}};
            for (let i = 2; i <= _Tablero.MAX_DIMENSION(); ++i)
            {
                thisPrv._datos["dim"+i] = {total: 0, victoria: 0, derrota: 0};
            }
 
            refrescar();
        }

        /**
         * Aumentar en las estadísticas una nueva victoria o derrota.
         *
         * @param tipo Tipo de partida finalizada: "victoria" o "derrota".
         * @param dimension Dimensión de la partida finalizada.
         * @throws ArgumentosException si hay errores con los argumentos.
         */
        puntuar( tipo, dimension)
        {
            if (tipo !== "victoria" || tipo !== "derrota")
                throw new ArgumentosException( ArgumentosException.ERR_RANGO, 
                                               "Estadisticas.puntuar", 
                                               ["tipo", tipo]);
            if (dimension < 2 || dimension > _Tablero.MAX_DIMENSION())
                throw new ArgumentosException( ArgumentosException.ERR_RANGO, 
                                               "Estadisticas.puntuar", 
                                               ["dimension", dimension]);

            let thisPrv = priv( this);
            thisPrv._datos.total.total++;
            thisPrv._datos.total[tipo]++
            thisPrv._datos["dim"+dimension].total++;
            thisPrv._datos["dim"+dimension][tipo]++;

            refrescar();
        }


        /**
         * Refrescar los datos de las estadísticas en pantalla
         */
        refrescar()
        {
            let thisPrv = priv( this);

            for (let tr of thisPrv._tabla.DOM.getElementsByTagName( "tr"))
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
            thisPrv._idPartidas = 1;
            thisPrv._partida = null;    // Partida actual.
        }

        /**
         * Atributo estadísticas donde se encuentran todos los datos de las 
         * estadísticas del juego.
         *
         * @return Objeto Estadisticas.
         */
        get estadisticas()
        {
            return priv( this)._estadisticas;
        }

        /**
         * Crear una nueva partida.
         *
         * @param dimension Dimensión que tendrá la nueva partida.
         * @param emparejados Número de cartas a emparejar en cada intento.
         * @param intentos Número de intentos a disponer en la partida.
         * @throws ObjetoDOMException Si el objeto DOM de id="partida" no existe
         */
        crearPartida( dimension, emparejados, intentos)
        {
            let thisPrv = priv( this);

            this.guardarPartida();

            let partidaDOM = document.getElementById( "partida");
            if (partidaDOM === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE,
                                              "Juego.crearPartida", "id=partida");

            thisPrv._partida = new _Partida( partidaDOM, dimension, emparejados, 
                                             intentos, ""+thisPrv._idPartidas++,
                                             this);
            thisPrv._partida.resultado( "Partida en curso");
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


    class _Partida extends ObjetoDOM
    {
        /**
         * Constructor de Partida.
         *
         * @param obj Objeto DOM donde se encuentran los detalles de la partida.
         * @param dimension Dimension del tablero.
         * @param emparejados Número de cartas a emparejar en cada intento.
         * @param maxIntentos Máximo número de intentos disponibles > 0.
         * @param id Id de la partida.
         * @param juego Juego al cual pertenece a la partida.
         * @param throws ArgumentosException Si hay errores en los argumentos.
         */
        constructor( obj, dimension, emparejados, maxIntentos, id, juego)
        {
            if (dimension < 2 || dimension > Tablero.MAX_DIMENSION ||
                emparejados < 2 || emparejados > dimension || 
                dimension % emparejados !== 0)
                throw new ArgumentosException( ArgumentosException.ERR_RANGO,
                                               "Partida.constructor()",
                                               ["dimension", dimension],
                                               ["emparejados", emparejados]);
            if (maxIntentos < 1)
                throw new ArgumentosException( ArgumentosException.ERR_RANGO,
                                               "Partida.constructor()",
                                               ["maxIntentos", dimension]);

            super( obj);
            let thisPrv = priv( this);
            thisPrv._intentos = 0;
            thisPrv._maxIntentos = maxIntentos;
            thisPrv._tablero = new Tablero(document.createElement("div"), this);
            let tableroDOM = this.DOM.getElementById( "tablero");
            if (tableroDOM === null)
                throw new ObjetoDOMException(ObjetoDOMException.ERR_NO_EXISTE, 
                                             "Partida.constructor","id=tablero");
            tableroDOM.innerHTML = "";
            tableroDOM.appendChild( thisPrv._tablero.DOM);
            thisPrv._dimension = dimension;
            thisPrv._emparejados = emparejados;
            thisPrv._juego = juego;
            thisPrv._id = id;
        }

        /**
         * Atributo getter para obtener el valor de id de la partida.
         *
         * @return Id de la partida.
         */
        get id()
        {
            return priv( this)._id;
        }

        /**
         * Atributo getter para obtener la dimensión de la partida.
         *
         * @return Dimensión de la partida.
         */
        get dimension()
        {
            return priv( this)._dimension;
        }

        /**
         * Atributo getter para obtener el número de cartas a emparejar en cada 
         * intento durante la partida.
         *
         * @return Número de cartas a emparejar en cada intento.
         */
        get emparejados()
        {
            return priv( this)._emparejados;
        }
 
        /**
         * Modificar el mensaje del resultado de la partida.
         *
         * @param mensaje Mensaje a mostrar como resultado de la partida.
         * @throws ObjetoDOMException Si hay error con los objetos DOM.
         */
        set resultado( mensaje)
        {
            let resultado = this.DOM.getElementById( "resultado");
            if (resultado === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE,
                                              "Partida.resultado",
                                              "id=resultado");
            resultado.textContent = mensaje;
        }


        /**
         * Se incrementa el número de intentos y se muestra el cambio.
         *
         * @throws ObjetoDOMException Si hay error con los objetos DOM.
         */
        incIntentos()
        {
            let intentos = this.DOM.getElementById( "intentos");
            if (intentos === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE,
                                              "Partida.incIntentos",
                                              "id=intentos");
 
            let thisPrv = priv( this);
            intentos.textContent = thisPrv._maxIntentos - ++thisPrv._intentos;
        }


       /**
         * Gastar un intento de los disponibles y comprobar si la partida ha 
         * finalizado por victoria o por gasto de todos los intentos.
         *
         * @return True si la partida ha finalizado; False si no ha acabado.
         */
        gastarIntento()
        {
            this.incIntentos();

            if (thisPrv._tablero.estanCartasArriba)
            {
                this.resultado = "¡¡¡GANASTE!!!";
                this( priv)._juego.estadisticas.puntuar( "victoria", 
                                                         thisPrv._dimension);
                return true;
            }

            if (restantes == 0)
            {
                this.resultado = "HAS PERDIDO GAÑÁN";
                this( priv)._juego.estadisticas.puntuar( "derrota", 
                                                         thisPrv._dimension);
               return true;
            }

            return false;
        }
    }

    return _Partida;
}



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



