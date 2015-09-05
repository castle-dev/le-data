/**
 * The object used to configure a type of data
 *
 * @interface LeTypeConfig
 *
 * @param type string - the LeData configured type to start the query from
 * @param id? string - The id of the individual record to serve as the root of the query
 */
class LeDataQuery {
	constructor(type:string, id?: string) {

	}

	/**
	* includes the LeData configured type field in the query.
	* If this is not called for a configured LeData type that is on the LeData, that field will not be included in the results.\
	*
	* @function include
	* @memberof LeDataQuery
	* @instance
	* @param filedName string - the name of the field to include in the query. The filed must be a configured LeData type.
	* @returns LeDataQuery -  the sub query object used to control an query specificaitons from the specified field.
	*/
	include(fieldName:string): LeDataQuery {
		return new LeDataQuery('ExampleType');
	}

	/**
	 * Returns only LeData objects where the specified fieldName is equal to the specified value.
	 * This function is only relevant if no id was specified in the constructor.
	 * This cannot be called if sortyBy is called on the query object.
	 * limitTo cannot be called multiple times on the same query object.
	 * Also calls sortyBy(fieldName)
	 *
	 * @function limitTo
	 * @memberof LeDataQuery
	 * @instance
	 * @param filedName string - the name of the field to check the values of
	 * @param value any -  the value to check the field against. Only accepts primitive values such as strings, numbers, and booleans.
	 */
	limitTo(fieldName:string, value:any):void {

	}

	/**
	 * Sorts the returned values with repect to the specified field.
	 * This cannot be called if limitTo is called on the query object.
	 * This function is only relevant if no id was specified in the constructor.
	 *
	 * @function sortyBy
	 * @memberof LeDataQuery
	 * @instance
	 * @param filedName string - the name of the field to sort the values of
	 */
	sortyBy(fieldName:string):void {

	}

	/**
	 * Limit the number of results to the first ones returned.
	 * Only used if an id was not specified in the constructor.
	 *
	 * @function limitToTop
	 * @memberof LeDataQuery
	 * @instance
	 * @param number number -  the number of results to limit the query to
	 */
	limitToTop(number: number) {

	}

	/**
	 * Limit the number of results to the last ones returned.
	 * Only used if an id was not specified in the constructor.
	 *
	 * @function limitToBottom
	 * @memberof LeDataQuery
	 * @instance
	 * @param number number -  the number of results to limit the query to
	 */
	limitToBottom(number: number) {
		
	}

	/**
	* Includes Deleted objects in the query.
	* This can only be called once on a query object.
	*
	* @function includeDeletedData
	* @memberof LeDataQuery
	* @instance
	*/
	includeDeletedData(){

	};
}
