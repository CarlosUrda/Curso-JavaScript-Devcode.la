//import * from 'utilidades';

"use strict";

/**
 * Mejoras:
 * - Que en las estadísticas cuente también el emparejamiento.
 * - Los objetos DOM se suelen comprobar solamente al crear los objetos. Podría 
 *   mejorarse si se hace una comprobación exhaustiva cada vez que se vaya a
 *   usar y si no existe, crearlo de nuevo. Aunque es posible que sea un poco 
 *   exagerado y con simplemente comprobar que existen al instanciar los objetos
 *   como ahora, sea suficiente.
 * - Ver cómo destruir el árbol DOM del tablero cuando la partida se guarda y 
 *   volver a recrearlo cuando la partida se vuelve a mostrar.
 */


var Juego = (function()
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
                     obj = document.createElement( "div"))
        {
            super( obj);
            this.DOM.classList.add( "carta");
            this.DOM.id = id;
            this.DOM.name = name;
            //this.DOM.style.width = Math.ceil( 100/_Tablero.MAX_DIMENSION)+"%";
            this.DOM.addEventListener( "click",
                    _Carta.prototype.pulsar.bind( this), false);
            this.ponerHaciaAbajo();

            let thisPrv = priv( this);
            thisPrv._valor = valor; 
            thisPrv._emparejada = false;
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
         * Cambiar la propiedad que indica si una carta ha sido emparejada.
         *
         * @param valor Boolean que indica si la carta ha sido emparejada.
         */
        set emparejada( valor)        
        {
            priv( this)._emparejada = Boolean( valor);
        }

        /**
         * Cambiar la propiedad que indica si una carta ha sido emparejada.
         *
         * @return valor Boolean que indica si la carta ha sido emparejada.
         */
        get emparejada()
        {
            return priv( this)._emparejada;
        }


        /**
         * Colocar una carta mirando boca abajo.
         */
        ponerHaciaAbajo()
        {
            let thisPrv = priv( this);
            this.DOM.classList.remove( "arriba");
            this.DOM.classList.add( "abajo");
            thisPrv._estaHaciaAbajo = true;
            this.DOM.innerHTML = "";
       }

        /**
         * Colocar una carta mirando boca arriba.
         */
        ponerHaciaArriba()
        {
            let thisPrv = priv( this);
            this.DOM.classList.remove( "abajo");
            this.DOM.classList.add( "arriba");
            thisPrv._estaHaciaAbajo = false;
            this.DOM.innerHTML = thisPrv._valor;
        }

        /**
         * Dar la vuelta a la carta.
         */
        voltear()
        {
            this.estaHaciaAbajo ? this.ponerHaciaArriba() 
                                : this.ponerHaciaAbajo();
        }


        /**
         * Manejador que se ejecutará cuando se pinche sobre la carta.
         */
        pulsar( evento)
        {            
            let thisPrv = priv( this);
            if (thisPrv._tablero.bloqueado || !this.estaHaciaAbajo || 
                !thisPrv._tablero.emparejarCarta( this))
            {
                evento.stopPropagation();
                return;
            }

            this.voltear();            
        }
    }


    /**
     * Clase Tablero donde están todas las cartas.
     */
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
         * Comprueba si todas las cartas del tablero han sido emparejadas.
         *
         * @return True/False dependiendo si todas las cartas están emparejadas.
         */
        get estanCartasEmparejadas()
        {
            return priv( this)._cartas.every( c => c.emparejada);
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
         * Atributo para bloquear o desbloquear el tablero y así no poder 
         * interactuar con él.
         *
         * @param valor True/False dependiendo si bloquear o desbloquear.
         */
        set bloqueado( valor)
        {
            priv( this)._bloqueado = Boolean( valor)
        }
 

        /**
         * Construye un tablero de cartas inicializándolo para empezar una 
         * nueva partida.
         */
        construir()
        {   
            //this.DOM.innerHTML = "";
            let thisPrv = priv( this);

            let totalCartas = Math.pow( thisPrv._partida.dimension, 2);
            thisPrv._cartas = new Array( totalCartas);

            let _valores = range(1, totalCartas/thisPrv._partida.emparejados+1);
            let valores = [];
            for (let i = 0; i < thisPrv._partida.emparejados; ++i)
                valores = valores.concat( _valores);

            for (let i = 0; i < totalCartas; ++i)
            {   
                let id = "carta" + (i+1);
                let k = parseInt( Math.random()*valores.length);
                thisPrv._cartas[i] = new _Carta( this, id, id, valores[k]);
                valores.splice( k, 1); 
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

            if (thisPrv._cartasAEmparejar.slice( 1).some( 
                        c => c.valor !== thisPrv._cartasAEmparejar[0].valor))
            {
                thisPrv._cartasAEmparejar.forEach( c => c.ponerHaciaAbajo());
            }
            else
            {
                thisPrv._cartasAEmparejar.forEach( c => c.emparejada = true);
            }

            thisPrv._cartasAEmparejar = new Array(0);
            thisPrv._partida.gastarIntento();
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


    /**
     * Clase Configuración. Representa toda la interfaz de configuración del 
     * Juego.
     */
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
            thisPrv._botonEmpezar = this.DOM.querySelector( "#empezar");
            if (thisPrv._botonEmpezar === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Configuracion()", "id=empezar");
            thisPrv._botonParar = this.DOM.querySelector( "#parar");
            if (thisPrv._botonParar === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Configuracion()", "id=parar");
            thisPrv._selectDimension = this.DOM.querySelector( "#dimension"); 
            if (thisPrv._selectDimension === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Configuracion()", "id=dimension");
            thisPrv._selectEmparejados = this.DOM.querySelector( "#emparejados");
            if (thisPrv._selectEmparejados === null)
                throw new ObjetoDOMException(ObjetoDOMException.ERR_NO_EXISTE, 
                                             "Configuracion()","id=emparejados");
            thisPrv._textIntentos = this.DOM.querySelector( "#intentos");
                      
            thisPrv._botonEmpezar.onclick = 
                _Configuracion.prototype.pulsarEmpezar.bind( this);
            thisPrv._botonParar.onclick = 
                _Configuracion.prototype.pulsarParar.bind( this);
            thisPrv._selectDimension.onchange = 
                _Configuracion.prototype.seleccionarDimension.bind( this);

            thisPrv._botonParar.disabled = true;
            thisPrv._juego = juego;

            for (let i = 2; i <= _Tablero.MAX_DIMENSION; ++i)
            {
                let opcion = document.createElement( "option");
                opcion.value = i;
                opcion.textContent = i;
                thisPrv._selectDimension.appendChild( opcion);
            }

            thisPrv._selectDimension.onchange();
        }


        /**
         * Manejador para cuando se pulsa el botón de empezar partida.
         */
        pulsarEmpezar()
        {
            let thisPrv = priv( this);

            thisPrv._juego.crearPartida( thisPrv._selectDimension.value,
                                         thisPrv._selectEmparejados.value,
                                         thisPrv._textIntentos.value);

            this.cambiarEstadoMenus( true);
        }

        /**
         * Manejador para cuando se pulsa el botón de parar partida actual.
         */
        pulsarParar()
        {
            if (!confirm("¿Deseas parar la partida actual dándola por perdida?")) 
                return;

            let thisPrv = priv( this);
            thisPrv._juego.partida.finalizar( "derrota");
        }

        
        /**
         * Cambiar el estado de los menús dependiendo si se encuentra la partida
         * en juego o, en cambio, la partida actual no está en juego.
         *
         * @param estadoPartida true si la partida actual está en juego
         *                      false si no está en juego la partida.
         */
        cambiarEstadoMenus( estadoPartida)
        {
            estadoPartida = Boolean( estadoPartida);
            let thisPrv = priv( this);

            thisPrv._botonEmpezar.disabled = estadoPartida;
            thisPrv._botonParar.disabled = !estadoPartida;
            thisPrv._selectDimension.disabled = estadoPartida;
            thisPrv._selectEmparejados.disabled = estadoPartida;
        }


        /**
         * Manejador a ejecutar cada vez se selecciona una dimensión.
         */
        seleccionarDimension( evento)
        {
            let thisPrv = priv( this);
            thisPrv._selectEmparejados.innerHTML = "";

            let dimension = thisPrv._selectDimension.value;
            for (let i of divisibles( Math.pow( dimension, 2)))
            {
                if (i == 1) continue;
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
            thisPrv._tabla.querySelector( "tbody").appendChild( fila);

            for (let i = 2; i <= _Tablero.MAX_DIMENSION; ++i)
            {
                thisPrv._datos["dim"+i] = {total: 0, victoria: 0, derrota: 0};
                fila = document.createElement( "tr");
                fila.dataset.tipo = "dim"+i;
                fila.innerHTML = 
                    `<th>Dimensión ${i}</th>
                     <td class="total" data-res="total">0</td>
                     <td class="victoria" data-res="victoria">0</td>
                     <td class="derrota" data-res="derrota">0</td>`
                thisPrv._tabla.querySelector( "tbody").appendChild( fila);
            }

            thisPrv._botonReiniciar = this.DOM.querySelector( "#reiniciar");
            if (thisPrv._botonReiniciar === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE, 
                                              "Estadisticas()", "id=reiniciar");
            thisPrv._botonRefrescar = this.DOM.querySelector( "#refrescar");
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
            for (let i = 2; i <= _Tablero.MAX_DIMENSION; ++i)
            {
                thisPrv._datos["dim"+i] = {total: 0, victoria: 0, derrota: 0};
            }
 
            this.refrescar();
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
            if (tipo !== "victoria" && tipo !== "derrota")
                throw new ArgumentosException( ArgumentosException.ERR_RANGO, 
                                               "Estadisticas.puntuar", 
                                               ["tipo", tipo]);
            if (dimension < 2 || dimension > _Tablero.MAX_DIMENSION)
                throw new ArgumentosException( ArgumentosException.ERR_RANGO, 
                                               "Estadisticas.puntuar", 
                                               ["dimension", dimension]);

            let thisPrv = priv( this);
            thisPrv._datos.total.total++;
            thisPrv._datos.total[tipo]++
            thisPrv._datos["dim"+dimension].total++;
            thisPrv._datos["dim"+dimension][tipo]++;

            this.refrescar();
        }


        /**
         * Refrescar los datos de las estadísticas en pantalla
         */
        refrescar()
        {
            let thisPrv = priv( this);

            [].forEach.call( thisPrv._tabla.getElementsByTagName( "tr"), 
                tr => [].forEach.call( tr.getElementsByTagName( "td"), 
                        td => td.textContent = 
                              thisPrv._datos[tr.dataset.tipo][td.dataset.res]));
        }
    }


    /**
     * Clase Partida. Representa una partida que se desarrolla dentro de un 
     * Juego.
     */
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
         * @throws ArgumentosException Si hay errores en los argumentos.
         * @throws ObjetoDOMException Si hay error con los objetos DOM.
         */
        constructor( obj, dimension, emparejados, maxIntentos, id, juego)
        {
            if (dimension < 2 || dimension > _Tablero.MAX_DIMENSION ||
                emparejados < 2 || emparejados > dimension*dimension || 
                dimension*dimension % emparejados !== 0)
                throw new ArgumentosException( ArgumentosException.ERR_RANGO,
                                               "Partida.constructor",
                                               ["dimension", dimension],
                                               ["emparejados", emparejados]);
            if (maxIntentos < 1)
                throw new ArgumentosException( ArgumentosException.ERR_RANGO,
                                               "Partida.constructor",
                                               ["maxIntentos", dimension]);

            super( obj);
            let thisPrv = priv( this);
            thisPrv._resultadoDOM = this.DOM.querySelector( "#resultado");
            if (thisPrv._resultadoDOM === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE,
                                              "Partida.constructor",
                                              "id=resultado");
            thisPrv._intentosDOM = this.DOM.querySelector( "#intentos");
            if (thisPrv._intentosDOM === null)
                throw new ObjetoDOMException( ObjetoDOMException.ERR_NO_EXISTE,
                                              "Partida.constructor",
                                              "id=intentos");

            thisPrv._intentos = 0;
            thisPrv._maxIntentos = maxIntentos;
            thisPrv._intentosDOM.textContent = maxIntentos;
            thisPrv._dimension = dimension;
            thisPrv._emparejados = emparejados;
            thisPrv._juego = juego;
            thisPrv._id = id;
            thisPrv._tablero = new _Tablero(document.createElement("div"), this);
            let tableroDOM = this.DOM.querySelector( "#tablero");
            if (tableroDOM === null)
                throw new ObjetoDOMException(ObjetoDOMException.ERR_NO_EXISTE, 
                                             "Partida.constructor","id=tablero");
            tableroDOM.innerHTML = "";
            tableroDOM.appendChild( thisPrv._tablero.DOM);
           
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
         */
        set resultado( mensaje)
        {
            priv( this)._resultadoDOM.textContent = mensaje;
        }


       /**
         * Gastar un intento de los disponibles y comprobar si la partida ha 
         * finalizado por victoria o por gasto de todos los intentos.
         *
         * @return True si la partida ha finalizado; False si no ha acabado.
         */
        gastarIntento()
        {
            let thisPrv = priv( this);
            let intentosRestantes = thisPrv._maxIntentos - ++thisPrv._intentos;
            thisPrv._intentosDOM.textContent = intentosRestantes;

            if (thisPrv._tablero.estanCartasEmparejadas)
            {
                this.finalizar( "victoria");
            }

            if (intentosRestantes == 0)
            {
                this.finalizar( "derrota");
            }
        }


        /**
         * Finalizar una partida con una victoria o una derrota.
         *
         * @param tipo Tipo de final: "victoria" o "derrota".
         * @throws ArgumentosException Si hay error en el argumento.
         */
        finalizar( tipo)
        {
            let thisPrv = priv( this);

            if (tipo == "victoria")
            {
                this.resultado = "¡¡¡GANASTE!!!";
                thisPrv._juego.estadisticas.puntuar( "victoria",
                                                     thisPrv._dimension);
            }
            else if (tipo == "derrota")
            {
                this.resultado = "HAS PERDIDO GAÑÁN";
                thisPrv._juego.estadisticas.puntuar( "derrota",
                                                     thisPrv._dimension);
            }
            else
                throw new ArgumentosException( ArgumentosException.ERR_RANGO,
                                               "Partida.finalizar",
                                               ["tipo", tipo]);

            thisPrv._juego.configuracion.cambiarEstadoMenus( false);
            thisPrv._tablero.bloqueado = true;
        }
    }


    /**
     * Clase Juego. Representa al Juego en sí. Debe ser creado para poder 
     * empezar a jugar.
     */
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
            thisPrv._estadisticas = new _Estadisticas( 
                document.getElementById( "estadisticas"), this);
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
         * Atributo configuracion donde se encuentran todos los menús de
         * configuración del juego.
         *
         * @return Objeto Configuracion.
         */
        get configuracion()
        {
            return priv( this)._configuracion;
        }
 
        /**
         * Atributo partida donde se encuentran todos los datos de la Partida
         * actual en juego. 
         *
         * @return Objeto Partida.
         */
        get partida()
        {
            return priv( this)._partida;
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
            thisPrv._partida.resultado = "Partida en curso";
        }

        /**
         * Finalizar y almacenar la partida actual en la lista de partidas 
         * finalizadas.
         * Hay que tener en cuenta que la partida guardada mantiene todo su 
         * árbol DOM del tablero.
         */
        guardarPartida()
        {            
            let thisPrv = priv( this);
            if (thisPrv._partida === null) return;

            thisPrv._partidasAnteriores[thisPrv._partida.id] = thisPrv._partida;
            thisPrv._partida = null;
        }

    }

    return _Juego;
})();



var juego; 

/**
 * Al cargarse la página inicialmente, se crean los marcadores donde se van a 
 * guardar las estadísticas y también se crean las opciones de selección.
 */
window.onload = function( evento) 
{

//    let juego = new Juego();
    try
    {
        juego = new Juego();
    }
    catch (e)
    {
        console.error( e);
        console.error( e.toString());
    }
};



