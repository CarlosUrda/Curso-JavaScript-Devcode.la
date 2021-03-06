"use strict";

/**
 * Herramientas con utilidades para otros programas.
 *
 * Mejoras:
 * - Añadir en GeneralException el rastro del objeto this desde el cual se lanza
 *   la excepción. Hay que pensar cómo guardar este objeto ya que no se dispone 
 *   del nombre de la variable desde el cual se llama al método donde ocurre la
 *   excepción. Se puede usar toSource, pero el resultado es demasiado largo.
 *   toString no vale, porque sólo dice el tipo de dato, y eso ya se sabe al 
 *   proporcionar el nombre de la función (Clase.metodo).
 */


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
        return new Array(Math.ceil(ini/paso)).fill(0).map( (v, i)=>i*paso);
    }

    let signo = Math.sign( paso);
    fin = parseInt( fin);
    if (isNaN( fin) || fin <= ini*signo) return null;

    return new Array(Math.ceil((fin-ini)/paso)).fill(0).map((v,i)=>ini+ i*paso);
} 


/**
 * Generador: Obtener todos los números que dividen a un número dado (no 
 * exclusivamente los factores).
 *
 * @param numero Número a calcular sus divisibles.
 * @return Generador de todos los números divisibles
 */
function *divisibles( numero)
{
    for (let i = 1; i <= numero/2; ++i)
        if (numero % i === 0) yield i;
}


/**
 * Función para definir una zona de memoria privada para cada cada uno de los
 * objetos instanciados de una clase. En dicha zona se podrán guardar miembros
 * privados de cada objeto.
 * Esta función debe ser llamada dentro de la función donde se define la Clase
 * que va a usar miembros privados para sus instancias.
 *
 * @return Función function( obj) que recibe un objeto como argumento y devuelve
 * la zona de memoria privada asignada para ese objeto instanciado.
 */
function defPrivados()
{
    var _objetosPrivados = new WeakMap();

    return function( obj)
    {
        if (!_objetosPrivados.has( obj))
            _objetosPrivados.set( obj, {});
        return _objetosPrivados.get( obj);
    };
}


/**
 * Excepción general.
 */
var GeneralException = (function()
{
    class _GeneralException extends Error
    {
        /**
         * Constructor.
         *
         * @param mensaje Descripción del error.
         * @param codigo Código identificador del error.
         * @param nombre Nombre del error.
         * @param funcion Nombre de la función donde se generó el error.
         */
        constructor( codigo = -1, nombre = "Error", mensaje = "Error",
                     funcion = "")
        {
            super();
            this.mensaje = String( mensaje);
            this.codigo = Number( codigo);
            this.nombre = String( nombre);
            this.pilaFunciones = funcion ? [String( funcion)] : [];
        }

        /**
         * Mostrar la excepción como una cadena de caracteres.
         */
        toString()
        {
            return `${this.codigo} (${this.nombre}) => ${this.mensaje}\n`
                 + `    Funciones: ${this.pilaFunciones}`;
        }

        /**
         * Se añade el nombre de una función a la pila de funciones a través de 
         * las cuales ha pasado el error.
         *
         * @param funcion Nombre de la función a agregar a la pila de funciones.
         */
        agregarFuncion( funcion)
        {
            this.pilaFunciones.push( String( funcion));
        }
    }

    return _GeneralException;
})();


/**
 * Excepción causada por los argumentos.
 */
var ArgumentosException = (function()
{
    const _ERR_GENERAL      = "-1",
          _ERR_RANGO        = "-2",
          _ERR_TIPO         = "-3",
          _ERR_VACIO        = "-4";

    const _errores = {[_ERR_GENERAL]: 
                            {nombre:  "general", 
                             mensaje: "Error en los argumentos"},
                      [_ERR_RANGO]: 
                            {nombre:  "rango_valores",
                             mensaje: "Valor fuera de rango en los argumentos"},
                      [_ERR_TIPO]: 
                            {nombre:  "tipo_dato",
                             mensaje: "Tipo de dato inválido en argumentos."},
                      [_ERR_VACIO]: 
                            {nombre:  "vacio",
                             mensaje: "Argumentos vacíos o nulos"}};


    class _ArgumentosException extends GeneralException
    {
        /**
         * Constructor.
         *
         * @param codigo Código identificador del error.
         * @param funcion Función donde se produjo la excepción.
         * @param args Argumentos afectados en el error. Cada uno de los 
         * parámetros puede ser únicamente un dato (como p.ej el nombre del 
         * argumento afectado), o un array de datos describiendo cada argumento
         * (P.ej: [nombre, valor, mensaje, ...]).
         */
        constructor( codigo = _ERR_GENERAL, funcion = "", ...args)
        {
            codigo = codigo in _errores ? codigo : _ERR_GENERAL;
            super( codigo, _errores[codigo].nombre, _errores[codigo].mensaje,
                   funcion);

            this.args = args;
        }

        /**
         * Propiedades de los tipos de errores.
         */
        static get ERR_GENERAL()    { return _ERR_GENERAL; }
        static get ERR_RANGO()      { return _ERR_RANGO; }
        static get ERR_TIPO()       { return _ERR_TIPO; }
        static get ERR_VACIO()      { return _ERR_VACIO; }


        /**
         * Mostrar la excepción como una cadena de caracteres.
         */
        toString()
        {
            return `[ArgumentosException]: ${super.toString()}\n`
                 + `    ${this.args ? ("argumentos: " + this.args) : "" }`;
        }
    }

    return _ArgumentosException;
})();


/**
 * Excepción causada con relación al DOM.
 */
var ObjetoDOMException = (function()
{
    const _ERR_GENERAL      = "-1",
          _ERR_NO_EXISTE    = "-2",
          _ERR_NO_CREADO    = "-3",
          _ERR_NO_MIEMBRO   = "-4";

    const _errores = {[_ERR_GENERAL]: 
                            {nombre:  "general", 
                             mensaje: "Error causado por objeto DOM"},
                      [_ERR_NO_EXISTE]: 
                            {nombre:  "no_existe",
                             mensaje: "El objeto DOM no existe."},
                      [_ERR_NO_CREADO]: 
                            {nombre:  "no_creado",
                             mensaje: "El Objeto DOM no ha podido crearse."},
                      [_ERR_NO_MIEMBRO]: 
                            {nombre:  "no_miembro",
                             mensaje: "El miembro del objeto DOM no existe."}};

    class _ObjetoDOMException extends GeneralException
    {
        /**
         * Constructor.
         *
         * @param codigo Código identificador del error.
         * @param funcion Función donde se produjo la excepción.
         * @param dom Representación del objeto DOM afectado, ya sea el mismo
         * objeto en sí o una descripción.
         * @param datos Parámetros con datos para describir el error relacionado 
         * con el Objeto DOM. Cada uno de los parámetros puede ser un dato como 
         * p.ej tipo de dato o valor.
         */
        constructor( codigo = _ERR_GENERAL, funcion = "", dom = null, ...datos)
        {
            codigo = codigo in _errores ? codigo : _ERR_GENERAL;
            super( codigo, _errores[codigo].nombre, _errores[codigo].mensaje, 
                   funcion);

            this.dom = dom;
            this.datos = datos;
        }

        /**
         * Propiedades de los tipos de errores.
         */
        static get ERR_GENERAL()         { return _ERR_GENERAL; }
        static get ERR_NO_EXISTE()       { return _ERR_NO_EXISTE; }
        static get ERR_NO_CREADO()       { return _ERR_NO_CREADO; }
        static get ERR_NO_MIEMBRO()      { return _ERR_NO_MIEMBRO; }


        /**
         * Mostrar la excepción como una cadena de caracteres.
         */
        toString()
        {
            return `[ObjetoDOMException]: ${super.toString()}\n`
                 + `    ${this.dom !== null ? ("Objeto DOM: " + this.dom) : "" }\n`
                 + `    ${this.datos ? ("Datos: " + this.datos) : ""}`;
        }
    }

    return _ObjetoDOMException;
})();


/**
 * Clase para envolver un objeto DOM y darle funcionalidad.
 */
var ObjetoDOM = (function()        
{
    var priv = defPrivados();

    class _ObjetoDOM
    {
        /**
         * Constructor.
         *
         * @param obj Objeto tipo DOM a envolver.
         * @throws ArgumentosException Si existe algún error en los argumentos.
         */
        constructor( obj)
        {
            if (!obj) 
                throw new ArgumentosException( ArgumentosException.ERR_VACIO,
                                               "ObjetoDOM.constructor", 
                                               ["obj", obj]);
            if (!('nodeType' in obj))
                throw new ArgumentosException( ArgumentosException.ERR_TIPO,
                                               "ObjetoDOM.constructor", 
                                               ["obj", typeof obj]);

            let thisPriv = priv( this);
            thisPriv._DOM = obj;
        }

        /**
         * Atributo setter.
         */
        set DOM( obj)
        {
            priv( this)._DOM = obj;
        }

        /**
         * Atributo getter.
         */
        get DOM()
        {
            return priv( this)._DOM;
        }
    }

    return _ObjetoDOM;
})();



