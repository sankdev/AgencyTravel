import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faBuilding, faFileAlt, faCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { customerService } from '../../services/customerService';
import { reservationService } from '../../services/reservationService';
import { destinationService } from '../../services/destinationService';
import { companyService } from '../../services/companyService';
import { volService } from '../../services/volService';
import { agencyService } from '../../services/agencyService';

const ReservationsByAgencie = () => {
    const [reservationsByCustomer, setReservationsByCustomer] = useState([]); // Liste des réservations par client
    const [agencies, setAgencies] = useState([]);
    const [vols, setVols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [destinations, setDestinations] = useState([]);
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]); // Define setCustomers
    const [customerId, setCustomerId] = useState(''); // Define customerId
    const[allCustomer,SetAllCustomer]=useState([])
    const [filter, setFilter] = useState('all')
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: ''
    });
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchCustomersAndReservations();
    }, []); // Charger les clients et leurs réservations au chargement de la page

    useEffect(() => {
        fetchVols();
        fetchClasses();
        fetchCompanies();
        fetchDestinations();
        fetchAgencies();
        fetchCustomersAll();
    }, [page, search]);


    const fetchCustomersAndReservations = async () => {
        setLoading(true);
        try {
            const agenciesResponse = await agencyService.getUserAgencies();  // Récupérer tous les clients
            const ageniciesList = Array.isArray(agenciesResponse.data) ? agenciesResponse.data : [];
            //console.log('agenciesList',ageniciesList)
            setCustomers(ageniciesList);
            
            // Récupérer les réservations pour chaque client
            const reservationsPromises = ageniciesList.map(async (customer) => {
                const reservationResponse = await reservationService.getReservationsByAgency(customer.id);
                return {
                    customer,
                    reservations: reservationResponse.data || []
                };
            });

            const customerReservations = await Promise.all(reservationsPromises);
            setReservationsByCustomer(customerReservations); // Mettre à jour les réservations par client
        } catch (err) {
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };  
    //console.log("listparAgency",reservationsByCustomer)

    const fetchVols = async () => {
        try {
            const response = await volService.getVols();
            setVols(Array.isArray(response) ? response : []); // Ensure vols is an array
        } catch (err) {
            setError('Failed to fetch vols');
        }
    };
    const fetchCustomersAll = async () => {
        try {
            const response = await customerService.getAllCustomersWithoutRestriction();
           // console.log('allCustomers',response.data)
            SetAllCustomer(response.data ); // Ensure vols is an array
        } catch (err) {
            setError('Failed to fetch vols');
        }
    };
    const fetchClasses = async () => {
        try {
            const response = await axios.get('/api/classes');
            //console.log('classList', response.data);
            setClasses(response.data);
        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
           // console.log('companieList', response);
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            //console.log('destinationList', response);
            setDestinations(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        setCancellingId(reservationId);
        try {
            await reservationService.cancelReservation(reservationId);
            // Mettre à jour la liste des réservations après l'annulation
            setReservationsByCustomer(reservationsByCustomer.map(customerData => ({
                ...customerData,
                reservations: customerData.reservations.map(reservation =>
                    reservation.id === reservationId
                        ? { ...reservation, status: 'cancelled' }
                        : reservation
                )
            })));
        } catch (err) {
            setError(err.message || 'Failed to cancel reservation');
        } finally {
            setCancellingId(null);
        }
    };
   

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getAgencies({ page, search });
           // console.log('API Response:', response);
    
            // Vérifiez si la pagination est présente
            if (response.pagination) {
                setTotalPages(response.pagination.page);
            } else {
                console.warn('Pagination is missing in response');
                setTotalPages(1); // Valeur par défaut si la pagination est absente
            }
    
            // Vérifiez si les données d'agences sont présentes
            if (Array.isArray(response.data)) {
                setAgencies(response.data);
            } else {
                setAgencies([]);
                console.warn('Agencies data is missing or not an array');
            }
        } catch (err) {
            console.error('Fetch error:', err.response ? err.response.data : err.message);
            setError('Failed to fetch agencies');
        }
    };

   

    // const filteredReservations = reservationsByCustomer.map((customerData) => {
    //     const filteredData = customerData.reservations.filter((reservation) => {
    //         const { status, startAt, endAt } = reservation;
    
    //         // Si "all" est sélectionné, on affiche toutes les réservations
    //         if (filters.status === 'all') return true;
    
    //         // Si un statut spécifique est sélectionné, on filtre par ce statut
    //         if (filters.status === 'pending' && status !== 'pending') return false;
    //         if (filters.status === 'confirmed' && status !== 'confirmed') return false;
    //         if (filters.status === 'cancelled' && status !== 'cancelled') return false;
    
    //         // Appliquer les filtres de date
    //         if (filters.startDate && new Date(startAt) < new Date(filters.startDate)) return false;
    //         if (filters.endDate && new Date(endAt) > new Date(filters.endDate)) return false;
    
    //         return true;
    //     });
    
    //     return { ...customerData, reservations: filteredData };
    // });
    
    const filteredReservations = reservationsByCustomer.map((customerData) => {
        const filteredData = customerData.reservations.filter((reservation) => {
            const { status, startAt, endAt } = reservation;
    
            // Si "all" est sélectionné, on garde toutes les réservations
            if (filters.status === 'all') return true;
    
            // Appliquer le filtre par statut (en s'assurant qu'il est bien défini)
            if (filters.status && status.toLowerCase() !== filters.status.toLowerCase()) return false;
    
            // Appliquer les filtres de date
            if (filters.startDate && new Date(startAt) < new Date(filters.startDate)) return false;
            if (filters.endDate && new Date(endAt) > new Date(filters.endDate)) return false;
    
            return true;
        });
    
        return { ...customerData, reservations: filteredData };
    });
    
    // Vérification des données filtrées
    //console.log('filteredReservations', filteredReservations);
    
    
    const filteredReservationsBy = reservationsByCustomer.filter(reservation => {
        if (filter === 'all') return true;
        return reservation.status.toLowerCase() === filter;
    });
//console.log('filteredReservations',filteredReservations)
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'text-yellow-500';
            case 'confirmed':
                return 'text-green-500';
            case 'cancelled':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const getClassById = (id) => {
        if (!classes || !classes.length) return 'Unknown';
        const classItem = classes.find((item) => item.id === parseInt(id));
       // console.log('classItem', classItem);
        return classItem ? classItem.name : 'Unknown';
    };
//console.log('getCustomerById',allCustomer) 
    const getCustomerById = (id) => {
        if (!allCustomer || !allCustomer.length) return 'Unknown';
        const customerItem = allCustomer.find((item) => item.id === parseInt(id));
        //console.log('customerItem', customerItem);
        return customerItem 
            ? `${customerItem.firstName || 'Unknown'} ${customerItem.lastName || 'Unknown'}` 
            : 'Unknown';
    }

    
    const getAgeciesById = (id) => {
        if (!agencies || !agencies.length) return 'Unknown';
        const classItem = agencies.find((item) => item.id === parseInt(id));
        //console.log('agencies', classItem);
        return classItem ? classItem.name : 'Unknown';
    };
/******  290ece6f-b5ca-4082-9543-6276cbec9ca1  *******/

    const getCompanyById = (id) => {
        if (!companies || !companies.length) return 'Unknown';
        const company = companies.find((item) => item.id === parseInt(id));
        return company ? company.name : 'Unknown';
    };

    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return 'Unknown';
        const destination = destinations.find((item) => item.id === parseInt(id));
        return destination ? destination.name : 'Unknown';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-0 max-h-full overflow-auto bg-gray-50 p-4 rounded-md shadow">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                    <FontAwesomeIcon icon={faPlane} className="text-indigo-500 mr-2" />
                    Listes de Reservations 
                </h1>
                
            </div>

            {/* Filtres */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>
                
            </div>

            {/* Liste des réservations */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700">{error}</div>
                )}
                <ul className="divide-y divide-gray-200">
                    {filteredReservations.map((customerData) => (
                        customerData.reservations.length > 0 ? (
                            <li key={customerData.customer.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="font-medium text-gray-900">
                                        <FontAwesomeIcon icon={faBuilding} className="text-gray-500 mr-2" />
                                        {customerData.customer.name} {customerData.customer.location}
                                    </div>
                                    {customerData.reservations.map((reservation) => (
                                        <div key={reservation.id} className="mt-2">
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                                                                {reservation.status}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                            {reservation.vols?.flight.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {formatDate(reservation.startAt)} - {formatDate(reservation.endAt)}
                                                            </div>
                                                            
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4">
                                                        <Link
                                                            to={`/agency/reservations/${reservation.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                        >
                                                            View Details
                                                        </Link>
                                                        {reservation.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancelReservation(reservation.id)}
                                                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:flex sm:justify-between">
                                                    <div className="sm:flex">
                                                        <div className="mr-6 flex items-center text-sm text-gray-500">
                                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-400 mr-1.5" />
                                                            {getAgeciesById(reservation.agencyId)}
                                                        </div>
                                                        {reservation.vol && (
                                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                                <FontAwesomeIcon icon={faPlane} className="text-gray-400 mr-1.5" />
                                                                Vol: {reservation.vol.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                        <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 mr-1.5" />
                                                        {reservation.typeDocument}: {reservation.numDocument}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ) : null
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ReservationsByAgencie;
