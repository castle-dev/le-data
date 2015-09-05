/**
 * The format for all data that will be stored in the storage provider.
 * The fields beginning with _ are fields with special meaning to the le-data-service module
 *
 * @interface LeData
 *
 */
interface LeData {

		/**
		* @var _id -  the unique string for this specific data object
		*/
    _id?: string;

		/**
		* @var _type -  the type to validated the LeData object against. The type cannot end with the characters '[]'.
    * '[]' at the end of a type has reserved meaning as an array of the specified type.
		*/
		_type: string;

		/**
		* @var _createdAt - the time the data was created in the remote storage provider
		*/
		_createdAt?: Date;

		/**
		* @var _lastUpdatedAt -  the time the data was last updated in the remote storage provider
		*/
		_lastUpdatedAt?: Date;

		/**
		* @var _deletedAt -  the time the data was deleted in the remote storage provider
		*/
		_deletedAt?: Date;
}
