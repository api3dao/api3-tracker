INSERT INTO api3_supply (
  "ts",
  "blockNumber",
  "circulatingSupply",
  "totalLocked",
  "totalStaked",
  "stakingTarget",
  "lockedByGovernance",
  "lockedVestings",
  "lockedRewards",
  "timeLocked"
) VALUES(
  Now(),
  2709,
  60905966,
  53350182,
  55475770,
  57128074,
  21960129,
  18825415,
  12564638,
  31390053
);

INSERT INTO "epochs" (
    "epoch",
    "createdAt",
    "blockNumber",
    "chainId",
    "txHash",
    "apr",
    "members",
    "totalStake",
    "totalShares",
    "mintedShares",
    "releaseDate",
    "isCurrent",
    "rewardsPct",
    "stakedRewards"
) VALUES (
    2689,
    '2021-07-14 00:15:53',
    12828258,
    1,
    E'\\xd29d9e55df72365e1e9b096b8850a6b0f612819d47d1175055c380721dcc8d18',
    38.75,
    1052,
    35129025,
    35129025,
    261061,
    '2022-07-14 00:15:53',
    0,
    0.7432,
    261061
), (
    2690,
    '2021-07-22 00:03:31',
    12872902,
    1,
    E'\\x2227ed6a09017d459c7cb1debcade9f1900f0d4598c9f6cfb441afc117c4b268',
    39.75,
    1495,
    42437593,
    42437593,
    323513,
    '2022-07-22 00:03:31',
    0,
    0.7623,
    261061 + 323513
), (
    2691,
    '2021-07-29 00:03:29',
    12828258,
    1,
    E'\\x1f5217eba1f08bf162dfc14d4da30e062596e54302f9a8c3af5f705a6cc02d8d',
    40.75,
    1752,
    35129025,
    35129025,
    349766,
    '2022-07-29 00:03:29',
    1,
    0.7815,
    261061 + 323513 + 349766
);

INSERT INTO "treasuries" (
  "ts",
  "ttype",
  "address",
  "token",
  "tokenAddress",
  "value",
  "current"
) VALUES (
  Now(),
  'PRIMARY',
  E'\\xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae',
  'API3',
  E'\\x0b38210ea11411557c13457d4da7dc6ea731b88a',
  7021201.00,
  1
), (
  Now(),
  'SECONDARY',
  E'\\x556ecbb0311d350491ba0ec7e019c354d7723ce0',
  'USDC',
  E'\\xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  17270419.133974,
  1
), (
  Now(),
  'V1',
  E'\\xe7af7c5982e073ac6525a34821fe1b3e8e432099',
  'API3',
  E'\\x0b38210ea11411557c13457d4da7dc6ea731b88a',
  14938928.2398374956310094,
  1
);

INSERT INTO "voting" (
  "id",
  "vt",
  "createdAt",
  "name",
  "status",
  "transferValue",
  "transferToken",
  "transferAddress",
  "totalGasUsed",
  "totalUsd",
  "totalFor",
  "totalAgainst",
  "totalStaked",
  "totalRequired"
) VALUES (
  'vt-1',
  'SECONDARY',
  Now(),
  'BUSINESS DEVELOPMENT TEAM, AUGUST-OCTOBER 2022',
  'pending',
  26738,
  'USDC',
  E'\\x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a',
  0.0261812,
  38.76,
  117138,
  0,
  42420299,
  6363044
);

INSERT INTO "members" (
    "address",
    "ensName",
    "ensUpdated",
    "badges",

    "userShare",
    "userStake",
    "userVotingPower",
    "userReward",
    "userLockedReward",
    "userDeposited",
    "userWithdrew",
    "tags"
) VALUES (
    E'\\x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a',
    '',
    Now(),
    'supports',

    12002100.00,
    12002100.00,
    2100.00,
    0.00,
    0.00,
    0.00,
    0.00,
    ''
);

INSERT INTO "member_events" (
  "id",
  "createdAt",
  "address",
  "chainId",
  "txHash",
  "blockNumber",
  "txIndex",
  "logIndex",
  "eventName",
  "data",
  "fee",
  "gasPrice",
  "gasUsed",
  "feeUsd"
) VALUES (
  '20220101',
  Now(),
  E'\\x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a',
  0,
  E'\\x2227ed6a09017d459c7cb1debcade9f1900f0d4598c9f6cfb441afc117c4b268',
  12942126,
  1,
  1,
  'CastVote',
  '{}',
  55,
  33,
  473402,
  39.7
);

INSERT INTO "voting_event" (
  "id",
  "createdAt",
  "chainId",
  "txHash",
  "blockNumber",
  "txIndex",
  "logIndex",
  "eventName",
  "data",
  "fee",
  "gasPrice",
  "gasUsed",
  "feeUsd",
  "address",
  "supports",
  "userShare",
  "userVotingPower",
  "votingId"
) VALUES (
  '20220101',
  Now(),
  0,
  E'\\x2227ed6a09017d459c7cb1debcade9f1900f0d4598c9f6cfb441afc117c4b268',
  12942126,
  1,
  1,
  'CastVote',
  '{}',
  55,
  33,
  473402,
  39.7,
  E'\\x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a',
  1,
  1000000,
  0.02005,
  'vt-1'
);


