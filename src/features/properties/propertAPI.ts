import api from '../../utils/axios';

export const fetchPropertiesAPI = async (params: Record<string, any>) => {
  const res: any = await api.get('/properties', { params });
  return res;
};

export const fetchFeaturedAPI = async () => {
  const res: any = await api.get('/properties/featured');
  return Array.isArray(res.data) ? { data: res.data } : res.data;
};

export const fetchPropertyBySlugAPI = async (slug: string) => {
  const res: any = await api.get(`/properties/${slug}`);
  return res;
};
