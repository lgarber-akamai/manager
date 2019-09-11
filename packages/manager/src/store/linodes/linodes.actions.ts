import { Notification } from 'linode-js-sdk/lib/account'
import { CreateLinodeRequest, Linode } from 'linode-js-sdk/lib/linodes'
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/linodes`);

/*
non-async actions for the purposes of updating the UI based on an event 
that comes down the stream
*/

export const updateMultipleLinodes = actionCreator<Linode[]>(
  'update_multiple'
);
export const addNotificationsToLinodes = actionCreator<Notification[]>(
  'add_notifications_to_all_linodes'
);
export const upsertLinode = actionCreator<Linode>(`upsert`);
export const deleteLinode = actionCreator<number>('delete');
export const updateLinode = actionCreator<{
  id: number;
  update: (v: Linode) => Linode;
}>('update');

/*
  Thunk Actions for the purposes of updating the UI based on some user
  action
 */

interface LinodeID {
  linodeId: number;
}
export type GetLinodeRequest = (params: LinodeID) => GetLinodeResponse;
export type GetLinodeResponse = Promise<Linode>;

export const getLinodesActions = actionCreator.async<
  void,
  Linode[],
  Linode.ApiFieldError[]
>('get-all');

export const getLinodeActions = actionCreator.async<
  LinodeID,
  Linode,
  Linode.ApiFieldError[]
>('get-one');

export type CreateLinodeParams = CreateLinodeRequest;
export const createLinodeActions = actionCreator.async<
  CreateLinodeParams,
  Linode,
  Linode.ApiFieldError[]
>('create');

export type UpdateLinodeParams = Partial<Linode> & LinodeID;
export const updateLinodeActions = actionCreator.async<
  UpdateLinodeParams,
  Linode,
  Linode.ApiFieldError[]
>(`update`);

export type DeleteLinodeParams = LinodeID;
export const deleteLinodeActions = actionCreator.async<
  DeleteLinodeParams,
  {},
  Linode.ApiFieldError[]
>('delete');

export type RebootLinodeParams = LinodeID & { configId?: number };
export const rebootLinodeActions = actionCreator.async<
  RebootLinodeParams,
  {},
  Linode.ApiFieldError[]
>('reboot');
