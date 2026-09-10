import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

export type FamilyGroupRow = Database['public']['Tables']['family_groups']['Row'];
export type FamilyMemberRow = Database['public']['Tables']['family_members']['Row'];

export interface FamilyMemberWithProfile extends FamilyMemberRow {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const familyService = {
  async getMyFamilyGroup(): Promise<FamilyGroupRow | null> {
    try {
      const localGroup = localStorage.getItem('nexo_local_family_group');
      if (localGroup) {
        return JSON.parse(localGroup);
      }
    } catch {
      // ignore
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const { data: membership, error: memErr } = await (supabase as any)
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memErr || !membership) return null;

      const { data: group, error: groupErr } = await (supabase as any)
        .from('family_groups')
        .select('*')
        .eq('id', (membership as any).family_id)
        .single();

      if (groupErr) return null;
      return group as FamilyGroupRow;
    } catch {
      return null;
    }
  },

  async createFamilyGroup(name: string): Promise<FamilyGroupRow> {
    const { data: { user } } = await supabase.auth.getUser();

    try {
      if (user) {
        const { data: group, error: groupErr } = await (supabase as any)
          .from('family_groups')
          .insert({
            name,
            owner_id: user.id,
          })
          .select()
          .single();

        if (!groupErr && group) {
          await (supabase as any)
            .from('family_members')
            .insert({
              family_id: (group as any).id,
              user_id: user.id,
              role: 'owner',
              permissions: { can_edit: true, can_invite: true },
            });

          return group as FamilyGroupRow;
        }
      }
    } catch (err) {
      console.warn('Supabase family group creation fallback to local storage:', err);
    }

    // Local Storage Fallback (for Guest / Offline / RLS setup)
    const inviteCode = `FAM-${Math.floor(100000 + Math.random() * 900000)}`;
    const localGroup: FamilyGroupRow = {
      id: `family-local-${Date.now()}`,
      name,
      owner_id: user?.id || 'guest-user',
      invite_code: inviteCode,
      created_at: new Date().toISOString(),
    };

    const localMember: FamilyMemberWithProfile = {
      id: `member-local-${Date.now()}`,
      family_id: localGroup.id,
      user_id: user?.id || 'guest-user',
      role: 'owner',
      joined_at: new Date().toISOString(),
      permissions: { can_edit: true, can_invite: true },
      profiles: {
        full_name: user?.email ? user.email.split('@')[0] : 'Proprietário (Eu)',
        avatar_url: null,
      },
    };

    localStorage.setItem('nexo_local_family_group', JSON.stringify(localGroup));
    localStorage.setItem('nexo_local_family_members', JSON.stringify([localMember]));

    return localGroup;
  },

  async joinFamilyByInviteCode(inviteCode: string): Promise<FamilyGroupRow> {
    const { data: { user } } = await supabase.auth.getUser();

    try {
      if (user) {
        const { data: group, error: groupErr } = await (supabase as any)
          .from('family_groups')
          .select('*')
          .eq('invite_code', inviteCode.trim())
          .single();

        if (!groupErr && group) {
          const { error: memErr } = await (supabase as any)
            .from('family_members')
            .insert({
              family_id: (group as any).id,
              user_id: user.id,
              role: 'member',
              permissions: { can_edit: true, can_invite: false },
            });

          if (!memErr) {
            return group as FamilyGroupRow;
          }
        }
      }
    } catch (err) {
      console.warn('Join family Supabase fallback:', err);
    }

    // Local Fallback
    const localGroup: FamilyGroupRow = {
      id: `family-joined-${Date.now()}`,
      name: `Grupo Familiar (${inviteCode.toUpperCase()})`,
      owner_id: 'owner-id',
      invite_code: inviteCode.trim().toUpperCase(),
      created_at: new Date().toISOString(),
    };

    const localMembers: FamilyMemberWithProfile[] = [
      {
        id: 'member-owner',
        family_id: localGroup.id,
        user_id: 'owner-id',
        role: 'owner',
        joined_at: new Date().toISOString(),
        permissions: { can_edit: true, can_invite: true },
        profiles: { full_name: 'Proprietário da Família', avatar_url: null },
      },
      {
        id: `member-me-${Date.now()}`,
        family_id: localGroup.id,
        user_id: user?.id || 'guest-user',
        role: 'member',
        joined_at: new Date().toISOString(),
        permissions: { can_edit: true, can_invite: false },
        profiles: { full_name: user?.email ? user.email.split('@')[0] : 'Eu', avatar_url: null },
      },
    ];

    localStorage.setItem('nexo_local_family_group', JSON.stringify(localGroup));
    localStorage.setItem('nexo_local_family_members', JSON.stringify(localMembers));

    return localGroup;
  },

  async getFamilyMembers(familyId: string): Promise<FamilyMemberWithProfile[]> {
    try {
      const localMembers = localStorage.getItem('nexo_local_family_members');
      if (localMembers) {
        return JSON.parse(localMembers);
      }
    } catch {
      // ignore
    }

    try {
      const { data, error } = await (supabase as any)
        .from('family_members')
        .select('*, profiles(full_name, avatar_url)')
        .eq('family_id', familyId);

      if (!error && data) {
        return data as FamilyMemberWithProfile[];
      }
    } catch {
      // ignore
    }

    return [
      {
        id: '1',
        family_id: familyId,
        user_id: 'me',
        role: 'owner',
        joined_at: new Date().toISOString(),
        permissions: { can_edit: true, can_invite: true },
        profiles: { full_name: 'Proprietário (Eu)', avatar_url: null },
      },
    ];
  },

  async leaveFamily(familyId: string): Promise<void> {
    localStorage.removeItem('nexo_local_family_group');
    localStorage.removeItem('nexo_local_family_members');

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        await (supabase as any)
          .from('family_members')
          .delete()
          .eq('family_id', familyId)
          .eq('user_id', user.id);
      } catch {
        // ignore
      }
    }
  },
};
