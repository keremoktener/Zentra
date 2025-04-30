import { apiSlice } from './apiSlice';
import { BusinessProfileDto } from '../types/dto';

export const businessProfileApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Query to get business profile by owner ID
        getBusinessProfileByOwnerId: builder.query<BusinessProfileDto, number>({
            query: (ownerId) => `/business-profiles/owner/${ownerId}`,
            providesTags: (result, error, ownerId) => 
                result ? [{ type: 'BusinessProfile', id: result.id ?? 'NEW' }] : [],
            // Handle 404 specifically if needed, or let the component handle it
        }),
        // Query to check if a profile exists for an owner
        hasBusinessProfile: builder.query<{ hasProfile: boolean }, number>({
            query: (ownerId) => `/business-profiles/has-profile/${ownerId}`,
            providesTags: (result, error, ownerId) => ['BusinessProfile'], // General tag for existence check
        }),
        // Mutation to create a new business profile
        createBusinessProfile: builder.mutation<BusinessProfileDto, Omit<BusinessProfileDto, 'id' | 'ownerName' | 'ownerEmail'> >({
            query: (newProfileData) => ({
                url: '/business-profiles',
                method: 'POST',
                body: newProfileData,
            }),
            // Invalidate cache tags related to business profiles after creation
            invalidatesTags: [{ type: 'BusinessProfile', id: 'LIST' }, { type: 'BusinessProfile', id: 'NEW' }],
        }),
        // Mutation to update an existing business profile
        updateBusinessProfile: builder.mutation<BusinessProfileDto, BusinessProfileDto>({
            query: (profileData) => ({
                url: `/business-profiles/${profileData.id}`,
                method: 'PUT',
                body: profileData,
            }),
            // Invalidate the specific profile tag only if the result ID is valid
            invalidatesTags: (result, error, profileData) => 
                result && result.id !== null 
                    ? [{ type: 'BusinessProfile', id: result.id }] 
                    : [],
        }),
        // Add other mutations like deleteBusinessProfile if needed
    }),
});

// Export hooks for usage in functional components
export const {
    useGetBusinessProfileByOwnerIdQuery,
    useHasBusinessProfileQuery,
    useCreateBusinessProfileMutation,
    useUpdateBusinessProfileMutation,
} = businessProfileApiSlice; 