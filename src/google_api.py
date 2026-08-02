"""
Integración con Google APIs para Google Business Profile
"""
import requests
from typing import Dict, List, Optional
from config import config
from src.logger import setup_logger

logger = setup_logger(__name__)

class GoogleBusinessAPI:
    """Clase para interactuar con Google Business Profile API"""
    
    def __init__(self):
        self.api_key = config.GOOGLE_API_KEY
        self.account_id = config.GOOGLE_BUSINESS_ACCOUNT_ID
        self.base_url = "https://mybusinessbusinessinformation.googleapis.com/v1"
        self.maps_url = "https://maps.googleapis.com/maps/api"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def get_business_profile(self) -> Optional[Dict]:
        """Obtener información del perfil empresarial"""
        try:
            url = f"{self.base_url}/accounts/{self.account_id}/locations"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            logger.info("Perfil empresarial obtenido exitosamente")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener perfil empresarial: {e}")
            return None
    
    def get_reviews(self, location_id: str) -> Optional[List[Dict]]:
        """Obtener reseñas de una ubicación"""
        try:
            url = f"{self.base_url}/accounts/{self.account_id}/locations/{location_id}/reviews"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            logger.info(f"Reseñas obtenidas para ubicación: {location_id}")
            return response.json().get("reviews", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener reseñas: {e}")
            return None
    
    def update_business_profile(self, location_id: str, data: Dict) -> bool:
        """Actualizar información del perfil empresarial"""
        try:
            url = f"{self.base_url}/accounts/{self.account_id}/locations/{location_id}"
            response = requests.patch(url, json=data, headers=self.headers)
            response.raise_for_status()
            logger.info(f"Perfil actualizado para ubicación: {location_id}")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al actualizar perfil: {e}")
            return False
    
    def get_local_search_insights(self, location_id: str) -> Optional[Dict]:
        """Obtener insights de búsqueda local"""
        try:
            url = f"{self.base_url}/accounts/{self.account_id}/locations/{location_id}/insights"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            logger.info(f"Insights obtenidos para ubicación: {location_id}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener insights: {e}")
            return None
    
    def search_nearby_competitors(self, latitude: float, longitude: float, 
                                 radius: int = 5000) -> Optional[List[Dict]]:
        """Buscar competidores cercanos usando Google Maps API"""
        try:
            url = f"{self.maps_url}/place/nearbysearch/json"
            params = {
                "location": f"{latitude},{longitude}",
                "radius": radius,
                "keyword": config.TARGET_SERVICE,
                "key": config.GOOGLE_MAPS_API_KEY
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            logger.info(f"Búsqueda de competidores completada: {latitude}, {longitude}")
            return response.json().get("results", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Error en búsqueda de competidores: {e}")
            return None
    
    def get_place_details(self, place_id: str) -> Optional[Dict]:
        """Obtener detalles de un lugar específico"""
        try:
            url = f"{self.maps_url}/place/details/json"
            params = {
                "place_id": place_id,
                "key": config.GOOGLE_MAPS_API_KEY,
                "fields": "name,rating,review_count,opening_hours,formatted_address,photos"
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            logger.info(f"Detalles del lugar obtenidos: {place_id}")
            return response.json().get("result", {})
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener detalles del lugar: {e}")
            return None

class GoogleMapsAPI:
    """Clase para búsquedas y análisis con Google Maps"""
    
    def __init__(self):
        self.api_key = config.GOOGLE_MAPS_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api"
    
    def geocode_address(self, address: str) -> Optional[Dict]:
        """Geocodificar una dirección"""
        try:
            url = f"{self.base_url}/geocode/json"
            params = {"address": address, "key": self.api_key}
            response = requests.get(url, params=params)
            response.raise_for_status()
            results = response.json().get("results", [])
            if results:
                logger.info(f"Geocodificación exitosa: {address}")
                return results[0]
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error en geocodificación: {e}")
            return None
    
    def search_keyword(self, keyword: str, location: str, 
                      radius: int = 5000) -> Optional[List[Dict]]:
        """Buscar negocios por palabra clave"""
        try:
            geocoded = self.geocode_address(location)
            if not geocoded:
                logger.warning(f"No se pudo geocodificar: {location}")
                return None
            
            lat = geocoded["geometry"]["location"]["lat"]
            lng = geocoded["geometry"]["location"]["lng"]
            
            url = f"{self.base_url}/place/nearbysearch/json"
            params = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "keyword": keyword,
                "key": self.api_key
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            logger.info(f"Búsqueda de palabra clave completada: {keyword}")
            return response.json().get("results", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Error en búsqueda de palabra clave: {e}")
            return None
