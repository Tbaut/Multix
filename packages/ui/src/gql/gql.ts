/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query MultisigById($id: String!) {\n  accounts(where: {id_eq: $id, isMultisig_eq: true}) {\n    id\n    threshold\n    signatories(limit: 50) {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n  }\n}": typeof types.MultisigByIdDocument,
    "query MultisigTxsById($multisigIds: [String!]) {\n  multisigTxes(where: {multisig: {id_in: $multisigIds}}) {\n    id\n    blockNumber\n    extrinsicIndex\n    status\n    callData\n    originBlockNumber\n    originExtrinsicIndex\n  }\n}": typeof types.MultisigTxsByIdDocument,
    "query MultisigsAndPureByAccount($accountIds: [String!], $watchedAccountIds: [String!]) {\n  accounts(\n    where: {AND: [{OR: [{id_in: $watchedAccountIds}, {signatories_some: {signatory: {id_in: $accountIds}}}, {signatories_some: {signatory: {id_in: $watchedAccountIds}}}]}, {OR: [{isMultisig_eq: true}, {isPureProxy_eq: true}]}]}\n  ) {\n    id\n    pubKey\n    isMultisig\n    isPureProxy\n    threshold\n    signatories {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n    delegateeFor {\n      id\n      type\n      delegator {\n        id\n        pubKey\n        isPureProxy\n      }\n      delegatee {\n        id\n        pubKey\n        isPureProxy\n      }\n    }\n    delegatorFor {\n      id\n      type\n      delegatee {\n        id\n        pubKey\n        isMultisig\n        threshold\n        signatories {\n          id\n          signatory {\n            id\n            pubKey\n          }\n        }\n      }\n    }\n  }\n}": typeof types.MultisigsAndPureByAccountDocument,
};
const documents: Documents = {
    "query MultisigById($id: String!) {\n  accounts(where: {id_eq: $id, isMultisig_eq: true}) {\n    id\n    threshold\n    signatories(limit: 50) {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n  }\n}": types.MultisigByIdDocument,
    "query MultisigTxsById($multisigIds: [String!]) {\n  multisigTxes(where: {multisig: {id_in: $multisigIds}}) {\n    id\n    blockNumber\n    extrinsicIndex\n    status\n    callData\n    originBlockNumber\n    originExtrinsicIndex\n  }\n}": types.MultisigTxsByIdDocument,
    "query MultisigsAndPureByAccount($accountIds: [String!], $watchedAccountIds: [String!]) {\n  accounts(\n    where: {AND: [{OR: [{id_in: $watchedAccountIds}, {signatories_some: {signatory: {id_in: $accountIds}}}, {signatories_some: {signatory: {id_in: $watchedAccountIds}}}]}, {OR: [{isMultisig_eq: true}, {isPureProxy_eq: true}]}]}\n  ) {\n    id\n    pubKey\n    isMultisig\n    isPureProxy\n    threshold\n    signatories {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n    delegateeFor {\n      id\n      type\n      delegator {\n        id\n        pubKey\n        isPureProxy\n      }\n      delegatee {\n        id\n        pubKey\n        isPureProxy\n      }\n    }\n    delegatorFor {\n      id\n      type\n      delegatee {\n        id\n        pubKey\n        isMultisig\n        threshold\n        signatories {\n          id\n          signatory {\n            id\n            pubKey\n          }\n        }\n      }\n    }\n  }\n}": types.MultisigsAndPureByAccountDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MultisigById($id: String!) {\n  accounts(where: {id_eq: $id, isMultisig_eq: true}) {\n    id\n    threshold\n    signatories(limit: 50) {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n  }\n}"): (typeof documents)["query MultisigById($id: String!) {\n  accounts(where: {id_eq: $id, isMultisig_eq: true}) {\n    id\n    threshold\n    signatories(limit: 50) {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MultisigTxsById($multisigIds: [String!]) {\n  multisigTxes(where: {multisig: {id_in: $multisigIds}}) {\n    id\n    blockNumber\n    extrinsicIndex\n    status\n    callData\n    originBlockNumber\n    originExtrinsicIndex\n  }\n}"): (typeof documents)["query MultisigTxsById($multisigIds: [String!]) {\n  multisigTxes(where: {multisig: {id_in: $multisigIds}}) {\n    id\n    blockNumber\n    extrinsicIndex\n    status\n    callData\n    originBlockNumber\n    originExtrinsicIndex\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MultisigsAndPureByAccount($accountIds: [String!], $watchedAccountIds: [String!]) {\n  accounts(\n    where: {AND: [{OR: [{id_in: $watchedAccountIds}, {signatories_some: {signatory: {id_in: $accountIds}}}, {signatories_some: {signatory: {id_in: $watchedAccountIds}}}]}, {OR: [{isMultisig_eq: true}, {isPureProxy_eq: true}]}]}\n  ) {\n    id\n    pubKey\n    isMultisig\n    isPureProxy\n    threshold\n    signatories {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n    delegateeFor {\n      id\n      type\n      delegator {\n        id\n        pubKey\n        isPureProxy\n      }\n      delegatee {\n        id\n        pubKey\n        isPureProxy\n      }\n    }\n    delegatorFor {\n      id\n      type\n      delegatee {\n        id\n        pubKey\n        isMultisig\n        threshold\n        signatories {\n          id\n          signatory {\n            id\n            pubKey\n          }\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query MultisigsAndPureByAccount($accountIds: [String!], $watchedAccountIds: [String!]) {\n  accounts(\n    where: {AND: [{OR: [{id_in: $watchedAccountIds}, {signatories_some: {signatory: {id_in: $accountIds}}}, {signatories_some: {signatory: {id_in: $watchedAccountIds}}}]}, {OR: [{isMultisig_eq: true}, {isPureProxy_eq: true}]}]}\n  ) {\n    id\n    pubKey\n    isMultisig\n    isPureProxy\n    threshold\n    signatories {\n      id\n      signatory {\n        id\n        pubKey\n      }\n    }\n    delegateeFor {\n      id\n      type\n      delegator {\n        id\n        pubKey\n        isPureProxy\n      }\n      delegatee {\n        id\n        pubKey\n        isPureProxy\n      }\n    }\n    delegatorFor {\n      id\n      type\n      delegatee {\n        id\n        pubKey\n        isMultisig\n        threshold\n        signatories {\n          id\n          signatory {\n            id\n            pubKey\n          }\n        }\n      }\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;