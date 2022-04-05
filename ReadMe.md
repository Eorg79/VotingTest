# Alyra Test Voting

This project is unit testing of a solidity voting smart contract.

## Commands

to install dependencies: "npm install",
to run ganache: "ganache",
to migrate: "truffle migrate",
to test: "truffle test",
to check coverage: "truffle run coverage"


## Unit tests
44 valid tests

Every functions of  Voting.sol contract are tested

1 file: testVoting.js

coverage with truffle run coverage :
-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |      100 |      100 |      100 |                |
  Voting.sol |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|


### 1)  tests storage of voters
***
#### a) tests setter getter
    should update status in voters mapping, get hasVoted true
    should update votedProposalId in voters mapping, get votedProposalId 1
    should update voteCount in proposals array, get voteCount 1
    should increment voteCount in proposals array, get voteCount 2
***
#### b) tests requires/revert et event
    should store Voter 1 in mapping, get event voterRegistered
    should not store a Voter when not registered by owner, revert
    should not store an already registered Voter, revert
    should not store a Voter when not at the addVoter stage, revert
***
### 2) tests storage of proposals
***
#### a) tests setter getter
    should store a proposal in array, get description
    should store a proposal in array, get initial VoteCount 0
    should store many proposals from different voters in array, get one by id
    should store many proposal from the same voter in array, get all by id
***
#### b) tests requires/revert et event
    should store a proposal in array, get event proposalRegistered
    should not store a proposal when registered by a non registered Voter, revert
    should not store an empty Proposal, revert
    should not store a proposal when not at the addProposal stage, revert
***
### 3) tests setVote
#### a) tests setter getter
    should update status in voters mapping, get hasVoted true
    should update votedProposalId in voters mapping, get votedProposalId 1
    should update voteCount in proposals array, get voteCount 1
    should increment voteCount in proposals array, get voteCount 2
***
#### b) tests requires/revert et event
    should not register vote when not at VotingSessionStarted stage, revert
    should not register vote from a non registered voter, revert
    should not register vote from an hasVoted voter, revert
    should not register vote for a non existing proposalId, revert
    should register vote, get event proposalRegistered
***
### 4) tests tallyVotes
***
#### a) tests tallyVotes, get result
    should get the Id of the highest voteCount Proposal, Id 2
***
#### b) tests requires/revert et event
    should not tally votes when not at VotingSessionEnded stage, revert
    should not tally votes if not called by owner, revert
    should tally votes, get event VotesTallied
***
### 5) tests change workflow status
***
#### a) tests startProposalsRegistering
    should not start Proposals Registering if not called by owner, revert
    should not start Proposals Registering if not called at Registering Voters stage, revert
    should start Proposals Registering when called by owner
    should emit event when start Proposals Registering
***
#### b) tests endProposalsRegistering
    should not end Proposals Registering if not called by owner, revert
    should not end Proposals Registering if not called at Registering Proposals stage, revert
    should end Proposals Registering when called by owner
    should emit event when start Proposal Registering
***
#### c) tests startVotingSession
    should not startVotingSession if not called by owner, revert
    should not startVotingSession if not called at ProposalsRegistrationEnded stage, revert
    should startVotingSession when called by owner
    should emit event when startVotingSession
***
#### d) tests endVotingSession
    should not endVotingSession if not called by owner, revert
    should not endVotingSession if not called at VotingSessionStarted stage, revert
    should endVotingSession when called by owner
    should emit event when endVotingSession 
***