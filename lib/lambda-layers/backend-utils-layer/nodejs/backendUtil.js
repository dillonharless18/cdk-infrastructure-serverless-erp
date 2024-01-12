const getPageOffsetFromPageNo = (pageNumber, pageSize) => {
    if (pageNumber < 1) pageNumber = 1;
    const offset = (pageNumber - 1) * pageSize;

    return offset;
};

export { getPageOffsetFromPageNo };
