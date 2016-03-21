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
 * Excepción personalizada.
 */
export var PersonalException = (function()
{
    var priv = defPrivados();

    class _PersonalException extends Error
    {
        constructor( mensaje, codigo = -1)
        {
            let thisPrv = priv( this);
            thisPrv._mensaje = String( mensaje);
            thisPrv._codigo = Number( codigo);
        }

        toString()
        {
            let thisPrv = priv( this);
            return thisPrv._codigo + " " + thisPrv._mensaje
        }
    }

    return _PersonalException;
})();


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



