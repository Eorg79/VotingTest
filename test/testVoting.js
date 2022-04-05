const Voting = artifacts.require("../contracts/Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('voting', accounts => {
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];
    const voter4 = accounts[4];
    const voter5 = accounts[5];
    const voter6 = accounts[6];
    const voter7 = accounts[7];
    const voter8 = accounts[8];
    const unregisteredVoter = accounts[9];
    
    let VotingInstance;


    describe("test storage of voters", function () {
    
        describe("tests setter/getter", function () {
        
            before(async function () {
                VotingInstance = await Voting.new({from:owner});
            });
        
            it("should store Voter 1 in mapping, get isRegistered true", async () => {
                await VotingInstance.addVoter(voter1, { from: owner });
                const storedData = await VotingInstance.getVoter(voter1, { from: voter1 });
                expect(storedData.isRegistered).to.equal(true);
            });
        
            it("should store Voter 2 in mapping, get hasVoted false", async () => {
                await VotingInstance.addVoter(voter2, { from: owner });
                const storedData = await VotingInstance.getVoter(voter2, { from: voter2 });
                expect(storedData.hasVoted).to.equal(false);
            });
        
            it("should store Voter 3 in mapping, get votedProposalID 0", async () => {
                await VotingInstance.addVoter(voter3, { from: owner });
                const storedData = await VotingInstance.getVoter(voter3, { from: voter3 });
                expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(0));
            });

        });

        describe("tests event et requires/revert", function () {
        
            before(async function () {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should store Voter 1 in mapping, get event voterRegistered", async () => {
                const findEvent = await VotingInstance.addVoter(voter1, { from: owner });
                expectEvent(findEvent,"VoterRegistered", {voterAddress: voter1});
            });

            it("should not store a Voter when not registered by owner, revert", async () => {
                await expectRevert(VotingInstance.addVoter(voter2, { from: voter2 }), 'Ownable: caller is not the owner');
            });

            it("should not store an already registered Voter, revert", async () => {
                await expectRevert(VotingInstance.addVoter(voter1, { from: owner }), 'Already registered');
            });
            
            it("should not store a Voter when not at the addVoter stage, revert", async () => {
                await VotingInstance.startProposalsRegistering();
                await expectRevert(VotingInstance.addVoter(voter3, { from: owner }), 'Voters registration is not open yet');
            });
            
        });
        
    });

    describe("test storage of proposals", function () {
    
        describe("tests setter/getter", function () {
        
            beforeEach(async function () {
                VotingInstance = await Voting.new({ from: owner });
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.addVoter(voter2, {from: owner});
                await VotingInstance.addVoter(voter3, {from: owner});
                await VotingInstance.startProposalsRegistering(); 
            });

            it("should store a proposal in array, get description", async () => {     
                await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
                const storedData = await VotingInstance.getOneProposal(0, {from:voter1});
                expect(storedData.description).to.equal("des frites tous les jours");
            });
            
            it("should store a proposal in array, get initial VoteCount 0", async () => {     
                await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
                const storedData = await VotingInstance.getOneProposal(0, {from:voter1});
                expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(0));
            });

            it("should store many proposals from different voters in array, get one by id", async () => {
                await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
                await VotingInstance.addProposal("du poisson le vendredi", {from:voter2});
                await VotingInstance.addProposal("du gateau au chocolat en dessert", {from:voter3});
                const storedData = await VotingInstance.getOneProposal(1, {from:voter1});
                expect(storedData.description).to.equal("du poisson le vendredi");
                expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(0));
            });

            it("should store many proposal from the same voter in array, get all by id", async () => { 
                await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
                await VotingInstance.addProposal("du poisson le vendredi", {from:voter1});
                let storedData = await VotingInstance.getOneProposal(0, {from:voter1});
                expect(storedData.description).to.equal("des frites tous les jours");
                expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(0));
                storedData = await VotingInstance.getOneProposal(1, {from:voter1});
                expect(storedData.description).to.equal("du poisson le vendredi");
                expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(0));
            });

        });
        
        describe("tests event et requires/revert", function () {
        
            beforeEach(async function () {
                VotingInstance = await Voting.new({from: owner});
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.startProposalsRegistering();                 
            });

            it("should store a proposal in array, get event proposalRegistered", async () => {
                const findEvent = await VotingInstance.addProposal("des frites tous les jours", {from: voter1});
                expectEvent(findEvent,"ProposalRegistered", {proposalId: new BN(0)});
            });

            it("should not store a proposal when registered by a non registered Voter, revert", async () => {
                await expectRevert(VotingInstance.addProposal("des frites tous les jours", {from: unregisteredVoter}), "You're not a voter");
            });
           
            it("should not store an empty Proposal, revert", async () => {
                await expectRevert(VotingInstance.addProposal("", {from: voter1}), 'Vous ne pouvez pas ne rien proposer');
            });

            it("should not store a proposal when not at the addProposal stage, revert", async () => {
                await VotingInstance.endProposalsRegistering();
                await expectRevert(VotingInstance.addProposal("des frites tous les jours", {from: voter1}), 'Proposals are not allowed yet');
            });    
        });
    });        

    describe("test setVote", function () {

        describe("test setter/getter", function () {

            before(async function () {
                VotingInstance = await Voting.new({ from: owner });
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.addVoter(voter2, {from: owner});
                await VotingInstance.addVoter(voter3, {from: owner});
                await VotingInstance.addVoter(voter4, {from: owner});
                await VotingInstance.startProposalsRegistering();
                await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
                await VotingInstance.addProposal("du poisson le vendredi", {from:voter2});
                await VotingInstance.addProposal("du gateau au chocolat en dessert", {from:voter3});
                await VotingInstance.endProposalsRegistering();
                await VotingInstance.startVotingSession(); 
            });

            it("should update status in voters mapping, get hasVoted true", async () => {            
                await VotingInstance.setVote(0, {from:voter1});
                const storedData = await VotingInstance.getVoter(voter1, { from: voter1 });
                expect(storedData.hasVoted).to.equal(true);
            });

            it("should update votedProposalId in voters mapping, get votedProposalId 1", async () => {            
                await VotingInstance.setVote(1, {from:voter2});
                const storedData = await VotingInstance.getVoter(voter2, { from: voter2 });
                expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(1));
            });

            it("should update voteCount in proposals array, get voteCount 1", async () => {            
                await VotingInstance.setVote(2, {from:voter3});
                const storedData = await VotingInstance.getOneProposal(2, { from: voter2 });
                expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(1));
            });

            it("should increment voteCount in proposals array, get voteCount 2", async () => {            
                await VotingInstance.setVote(2, {from: voter4});
                const storedData = await VotingInstance.getOneProposal(2, { from: voter2 });
                expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(2));
            });
            
        });

        describe("test requires/revert et event", function () {
            
            before(async function () {
                VotingInstance = await Voting.new({ from: owner });
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.addVoter(voter2, {from: owner});
                await VotingInstance.startProposalsRegistering();
                await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
                await VotingInstance.addProposal("du poisson le vendredi", {from:voter1});
                await VotingInstance.endProposalsRegistering();
            });

            it("should not register vote when not at VotingSessionStarted stage, revert", async () => {            
                await expectRevert(VotingInstance.setVote(0, {from: voter1}), "Voting session havent started yet");
            });

            it("should not register vote from a non registered voter, revert", async () => {            
                await VotingInstance.startVotingSession();
                await expectRevert(VotingInstance.setVote(0, {from: unregisteredVoter}), "You're not a voter");
            });

            it("should not register vote from an hasVoted voter, revert", async () => {            
                await VotingInstance.setVote(0, {from:voter1})
                await expectRevert(VotingInstance.setVote(1, {from: voter1}), "You have already voted");
            });

            it("should not register vote for a non existing proposalId, revert", async () => {            
                await expectRevert(VotingInstance.setVote(6, {from: voter2}), "Proposal not found");
            });

            it("should register vote, get event proposalRegistered", async () => {
                const findEvent = await VotingInstance.setVote(1, {from:voter2});
                expectEvent(findEvent,"Voted", {voter: voter2, proposalId: new BN(1)});
            });
            
        });

    });

    describe("test tallyVotes", function () {
    
        describe("test tallyVotes, get result", function () {
        
            before(async function () {
            VotingInstance = await Voting.new({ from: owner });
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.addVoter(voter2, {from: owner});
            await VotingInstance.addVoter(voter3, {from: owner});
            await VotingInstance.addVoter(voter4, {from: owner});
            await VotingInstance.addVoter(voter5, {from: owner});
            await VotingInstance.addVoter(voter6, {from: owner});
            await VotingInstance.addVoter(voter7, {from: owner});
            await VotingInstance.addVoter(voter8, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
            await VotingInstance.addProposal("du poisson le vendredi", {from:voter2});
            await VotingInstance.addProposal("du gateau au chocolat en dessert", {from:voter3});
            await VotingInstance.addProposal("du pain sur les tables", {from:voter4});
            await VotingInstance.addProposal("plus de legumes", {from:voter5});
            await VotingInstance.addProposal("du coca", {from:voter6});
            await VotingInstance.addProposal("du ketchup", {from:voter7});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.setVote(2, {from: voter1});
            await VotingInstance.setVote(1, {from: voter2});
            await VotingInstance.setVote(0, {from: voter3});
            await VotingInstance.setVote(0, {from: voter4});
            await VotingInstance.setVote(2, {from: voter5});
            await VotingInstance.setVote(4, {from: voter6});
            await VotingInstance.setVote(2, {from: voter7});
            await VotingInstance.setVote(3, {from: voter8});
            await VotingInstance.endVotingSession({from: owner});
            });
        
        it("should get the Id of the highest voteCount Proposal, Id 2", async () => {                     
            await VotingInstance.tallyVotes({ from: owner });
            const Id = await VotingInstance.winningProposalID.call();
            expect(new BN(Id)).to.be.bignumber.equal(new BN(2));
            });
        });       
    
    describe("test requires/revert et event", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({ from: owner });
            await VotingInstance.addVoter(voter1, {from: owner});
            await VotingInstance.addVoter(voter2, {from: owner});
            await VotingInstance.addVoter(voter3, {from: owner});
            await VotingInstance.addVoter(voter4, {from: owner});
            await VotingInstance.startProposalsRegistering({from: owner});
            await VotingInstance.addProposal("des frites tous les jours", {from:voter1});
            await VotingInstance.addProposal("du poisson le vendredi", {from:voter2});
            await VotingInstance.endProposalsRegistering({from: owner});
            await VotingInstance.startVotingSession({from: owner});
            await VotingInstance.setVote(0, {from: voter1});
            await VotingInstance.setVote(1, {from: voter2});
            await VotingInstance.setVote(0, {from: voter3});
            await VotingInstance.setVote(0, {from: voter4});
        });

        it("should not tally votes when not at VotingSessionEnded stage, revert", async () => {            
            await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
            });   
            
        it("should not tally votes if not called by owner, revert", async () => {            
            await VotingInstance.endVotingSession({from: owner});
            await expectRevert(VotingInstance.tallyVotes({from: voter1}), 'Ownable: caller is not the owner');
            });   
            
        it("should tally votes, get event VotesTallied", async () => {
            await VotingInstance.endVotingSession({from: owner});
            const initialStatus = await VotingInstance.workflowStatus({from: owner});
            expect(initialStatus.toString()).to.equal(Voting.WorkflowStatus.VotingSessionEnded.toString());
            const findEvent = await VotingInstance.tallyVotes({ from: owner });
            const updatedStatus = await VotingInstance.workflowStatus({from: owner});
            expect(updatedStatus.toString()).to.equal(Voting.WorkflowStatus.VotesTallied.toString());
            expectEvent(findEvent,"WorkflowStatusChange", {previousStatus: initialStatus, newStatus: updatedStatus});
            
        });    
    });

    });

    describe("test change workflow status", function () {
        
        describe("test startProposalsRegistering", function () {
            
            beforeEach(async function () {
                VotingInstance = await Voting.new({ from: owner });
                await VotingInstance.addVoter(voter1, {from: owner});
            });

            it("should not start Proposals Registering if not called by owner, revert", async () => {            
                await expectRevert(VotingInstance.startProposalsRegistering({from: voter1}), 'Ownable: caller is not the owner');
            }); 

            it("should not start Proposals Registering if not called at Registering Voters stage, revert", async () => {            
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.endProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.startProposalsRegistering({from: owner}), 'Registering proposals cant be started now');
            }); 

            it("should start Proposals Registering when called by owner", async () => {            
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                console.log(initialStatus.toString());
                expect(initialStatus.toString()).to.equal(Voting.WorkflowStatus.RegisteringVoters.toString());
                await VotingInstance.startProposalsRegistering({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expect(updatedStatus.toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationStarted.toString());
            });

            it("should emit event when start Proposals Registering", async () => {
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                const findEvent = await VotingInstance.startProposalsRegistering({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus: initialStatus, newStatus: updatedStatus});
            });
        
        });

        describe("test endProposalsRegistering", function () {

            beforeEach(async function () {
                VotingInstance = await Voting.new({ from: owner });
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.startProposalsRegistering({from: owner});
            });

            it("should not end Proposals Registering if not called by owner, revert", async () => {            
                await expectRevert(VotingInstance.endProposalsRegistering({from: voter1}), 'Ownable: caller is not the owner');
            }); 

            it("should not end Proposals Registering if not called at Registering Proposals stage, revert", async () => {            
                await VotingInstance.endProposalsRegistering({from: owner});
                await VotingInstance.startVotingSession({from: owner});
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), 'Registering proposals havent started yet');
            }); 

            it("should end Proposals Registering when called by owner", async () => {            
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                console.log(initialStatus.toString());
                expect(initialStatus.toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationStarted.toString());
                await VotingInstance.endProposalsRegistering({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expect(updatedStatus.toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationEnded.toString());
            });

            it("should emit event when start Proposal Registering", async () => {
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                const findEvent = await VotingInstance.endProposalsRegistering({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus: initialStatus, newStatus: updatedStatus});
            });
        
        });

        describe("test startVotingSession", function () {

            beforeEach(async function () {
                VotingInstance = await Voting.new({ from: owner });
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.startProposalsRegistering({from: owner});              
            });

            it("should not startVotingSession if not called by owner, revert", async () => {            
                await VotingInstance.endProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.startVotingSession({from: voter1}), 'Ownable: caller is not the owner');
            }); 

            it("should not startVotingSession if not called at ProposalsRegistrationEnded stage, revert", async () => {            
                await expectRevert(VotingInstance.startVotingSession({from: owner}), 'Registering proposals phase is not finished');
            }); 

            it("should startVotingSession when called by owner", async () => {            
                await VotingInstance.endProposalsRegistering({from: owner});
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                console.log(initialStatus.toString());
                expect(initialStatus.toString()).to.equal(Voting.WorkflowStatus.ProposalsRegistrationEnded.toString());
                await VotingInstance.startVotingSession({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expect(updatedStatus.toString()).to.equal(Voting.WorkflowStatus.VotingSessionStarted.toString());
            });

            it("should emit event when startVotingSession", async () => {
                await VotingInstance.endProposalsRegistering({from: owner});
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                const findEvent = await VotingInstance.startVotingSession({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus: initialStatus, newStatus: updatedStatus});
            });
        
        });
        
        describe("test endVotingSession", function () {

            beforeEach(async function () {
                VotingInstance = await Voting.new({ from: owner });
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.startProposalsRegistering({from: owner});  
                await VotingInstance.endProposalsRegistering({from: owner});            
            });

            it("should not endVotingSession if not called by owner, revert", async () => {            
                await VotingInstance.startVotingSession({from: owner});
                await expectRevert(VotingInstance.endVotingSession({from: voter1}), 'Ownable: caller is not the owner');
            }); 

            it("should not endVotingSession if not called at VotingSessionStarted stage, revert", async () => {            
                await expectRevert(VotingInstance.endVotingSession({from: owner}), 'Voting session havent started yet');
            }); 

            it("should endVotingSession when called by owner", async () => {            
                await VotingInstance.startVotingSession({from: owner});
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                console.log(initialStatus.toString());
                expect(initialStatus.toString()).to.equal(Voting.WorkflowStatus.VotingSessionStarted.toString());
                await VotingInstance.endVotingSession({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expect(updatedStatus.toString()).to.equal(Voting.WorkflowStatus.VotingSessionEnded.toString());
            });

            it("should emit event when endVotingSession", async () => {
                await VotingInstance.startVotingSession({from: owner});
                const initialStatus = await VotingInstance.workflowStatus({from: owner});
                const findEvent = await VotingInstance.endVotingSession({from: owner});
                const updatedStatus = await VotingInstance.workflowStatus({from: owner});
                expectEvent(findEvent,"WorkflowStatusChange", {previousStatus: initialStatus, newStatus: updatedStatus});
            });
        
        });

    });
})

