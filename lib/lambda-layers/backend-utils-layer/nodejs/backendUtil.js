const getPageOffsetFromPageNo = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    const offset = (pageNumber - 1) * pageSize;

    return offset;
};

export { getPageOffsetFromPageNo };
