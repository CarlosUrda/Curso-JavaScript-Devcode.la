"use strict";

/**
 * Herramientas con utilidades para otros programas.
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
export range( ini, fin, paso=1)
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


/**
 * Obtener todos los números que dividen a un número dado (no exclusivamente 
 * los factores).
 *
 * @param numero Número a calcular sus divisibles.
 */
export divisibles( numero)
{
    return (for (let i = 1; i < numero/2; ++i) if (numero % i == 0) i);
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
export function defPrivados()
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
export var GeneralException = (function()
{
    var priv = defPrivados();

    class _PersonalException extends Error
    {
        /**
         * Constructor.
         *
         * @param mensaje Descripción del error.
         * @param codigo Código identificador del error.
         * @param nombre Nombre del error.
         */
        constructor( codigo = -1, nombre = "Error", mensaje = "Error")
        {
            let thisPrv = priv( this);
            thisPrv._mensaje = String( mensaje);
            thisPrv._codigo = Number( codigo);
            thisPrv._nombre = String( nombre);
        }

        /**
         * Mostrar la excepción como una cadena de caracteres.
         */
        toString()
        {
            let thisPrv = priv( this);
            return thisPrv._codigo + ": " + thisPrv._nombre + " => " + 
                   thisPrv._mensaje;
        }
    }

    return _PersonalException;
})();


/**
 * Excepción causada por los argumentos.
 */
export var ArgumentosException = (function()
{
    var priv = defPrivados();

    const _ERR_GENERAL       = "-1",
          _ERR_RANGO_VALORES = "-2",
          _ERR_TIPO_DATO     = "-3",
          _ERR_VACIO         = "-4";

    const _errores = {_ERR_GENERAL: 
                            {nombre:  "general", 
                             mensaje: "Error en los argumentos"},
                      _ERR_RANGO_VALORES: 
                            {nombre:  "rango_valores",
                             mensaje: "Valor fuera de rango en los argumentos"},
                      _ERR_TIPO_DATO: 
                            {nombre:  "tipo_dato",
                             mensaje: "Tipo de dato inválido en argumentos."},
                      _ERR_VACIO: 
                            {nombre:  "vacio",
                             mensaje: "Argumentos vacíos"}};


    class _ArgumentosException extends GeneralException
    {
        /**
         * Constructor.
         *
         * @param codigo Código identificador del error.
         * @param args Nombre de los parámetros afectados en el error.
         */
        constructor( codigo = _ERR_GENERAL, ...args)
        {
            codigo = codigo in errores ? codigo : _ERR_GENERAL;
            super( codigo, errores[codigo].nombre, errores[codigo].mensaje);

            priv( this)._args = args;
        }

        /**
         * Propiedades de los tipos de errores.
         */
        static get ERR_GENERAL          { return _ERR_GENERAL; }
        static get ERR_RANGO_VALORES    { return _ERR_RANGO_VALORES; }
        static get ERR_TIPO_DATO        { return _ERR_TIPO_DATO; }
        static get ERR_VACIO            { return _ERR_VACIO; }


        /**
         * Mostrar la excepción como una cadena de caracteres.
         */
        toString()
        {
            let args = priv( this)._args;
            return `[ArgumentosException]: ${super.toString()}
                        ${args ? ("argumentos: " + args) : "" }`;
        }
    }

    return _ArgumentosException;
}


/**
 * Excepción causada con relación al DOM.
 */
export var ObjetoDOMException = (function()
{
    var priv = defPrivados();

    const _ERR_GENERAL      = "-1";
    const _ERR_NO_EXISTE    = "-2";
    const _ERR_NO_CREADO    = "-3";
    const _ERR_NO_MIEMBRO   = "-4";

    const _errores = {_ERR_GENERAL: 
                            {nombre:  "general", 
                             mensaje: "Error causado por objeto DOM"},
                      _ERR_NO_EXISTE: 
                            {nombre:  "no_existe",
                             mensaje: "El objeto DOM no existe."},
                      _ERR_NO_CREADO: 
                            {nombre:  "no_creado",
                             mensaje: "El Objeto DOM no ha podido crearse."},
                      _ERR_NO_MIEMBRO: 
                            {nombre:  "no_miembro",
                             mensaje: "El miembro del objeto DOM no existe."}};

    class _ObjetoDOMException extends GeneralException
    {
        /**
         * Constructor.
         *
         * @param codigo Código identificador del error.
         * @param dom Representación del objeto DOM afectado, ya sea el mismo
         * objeto en sí o una descripción.
         */
        constructor( codigo = _ERR_GENERAL, dom = null, datos = null)
        {
            codigo = codigo in errores ? codigo : _ERR_GENERAL;
            super( codigo, errores[codigo].nombre, errores[codigo].mensaje);

            thisPrv = priv( this);
            thisPrv._dom = dom;
            thisPrv._datos = datos;
        }

        /**
         * Propiedades de los tipos de errores.
         */
        static get ERR_GENERAL         { return _ERR_GENERAL; }
        static get ERR_NO_EXISTE       { return _ERR_NO_EXISTE; }
        static get ERR_NO_CREADO       { return _ERR_NO_CREADO; }
        static get ERR_NO_MIEMBRO      { return _ERR_NO_MIEMBRO; }


        /**
         * Mostrar la excepción como una cadena de caracteres.
         */
        toString()
        {
            thisPrv = priv( this);
            let dom = thisPrv._dom;
            let datos = thisPrv._datos;
            return `[ObjetoDOMException]: ${super.toString()}
                        ${dom !== null ? ("Objeto DOM: " + dom) : "" }
                        ${datos !== null ? ("Datos: " + datos)}`;
        }
    }

    return _ObjetoDOMException;
}


/**
 * Clase para envolver un objeto DOM y darle funcionalidad.
 */
export var ObjetoDOM = (function()        
{
    var priv = defPrivados();

    class _ObjetoDOM
    {
        /**
         * Constructor.
         *
         * @param obj Objeto DOM a envolver.
         */
        constructor( obj)
        {
            if (!(obj && 'nodeType' in obj))
                throw new PersonalException( "El objeto no es de tipo DOM");

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



