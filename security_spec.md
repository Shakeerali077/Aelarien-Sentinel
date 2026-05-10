# Aelarien Sentinel Security Specification

## 1. Data Invariants
- A **Project** must always have an `ownerId` matching the creator's UID.
- **Documents**, **Agents**, **Policies**, **AuditLogs**, and **Alerts** MUST belong to a valid `projectId`.
- Users can only read/write documents within projects they are members of.
- **AuditLogs** and **ChatMessages** are immutable after creation (enterprise compliance).
- **Policies** can only be modified by project admins.
- `createdAt` and `updatedAt` must use `request.time`.

## 2. The Dirty Dozen Payloads (Targeting Governance & Resilience)
1. **Identity Spoofing**: Creating a project with `ownerId` of another user.
2. **Path Injection**: Creating a document in a `projectId` the user doesn't belong to.
3. **Ghost Field Update**: Updating an AuditLog to change the `complianceStatus` from VIOLATION to COMPLIANT.
4. **Denial of Wallet**: Sending a document with a 10MB `content` string.
5. **ID Poisoning**: Using a 2KB string as a `projectId` or `policyId`.
6. **Orphaned Write**: Creating a policy without checking if the user owns the parent project.
7. **Temporal Fraud**: Setting `createdAt` to a future date instead of `request.time`.
8. **Privilege Escalation**: Adding oneself to `members` list of a project from a client-side call.
9. **Log Deletion**: Attempting to delete an AuditLog (Audit logs must be permanent).
10. **Shadow Policy Read**: Reading governed policies from a project the user is not a member of.
11. **Neural Injection**: Updating an agent's `systemInstruction` to bypass security filters.
12. **Policy Disabling**: An unauthorized user disabling a crucial `High Risk` policy.

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` will be created to verify these constraints.
