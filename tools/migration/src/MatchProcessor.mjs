export default class MatchProcessor {
    static processReverseResults(location, resultSet) {
        var resultSummary = { nameMatch: {count: 0, matchList: []}, partNameMatch: { count: 0, matchList: []}, addrMatch: {count: 0, matchList: []}};

        resultSet.features.forEach(reverseResult => {
            MatchProcessor.checkMatchType(MatchProcessor.isNameMatch, location, reverseResult, resultSummary.nameMatch);
            MatchProcessor.checkMatchType(MatchProcessor.isAddressMatch, location, reverseResult, resultSummary.addrMatch);
            MatchProcessor.checkMatchType(MatchProcessor.isPartNameMatch, location, reverseResult, resultSummary.partNameMatch);
        })

        return resultSummary;
    }

    static isNameMatch(location, reverseResult) {
        return location.name === reverseResult.properties.name;
    }

    static isAddressMatch(location, reverseResult) {
        return location.address == reverseResult.properties.formatted;
    }

    static isPartNameMatch(location, reverseResult) {
        let name1 = "";
        if (location.name != undefined) {
            name1 = location.name;
        }
        let name2 = "";
        if (reverseResult.properties.name != undefined) {
            name2 = reverseResult.properties.name;
        }

        if (name1 == "" || name2 == "") {
            return false;
        }
        if (name1.includes(name2) || name2.includes(name1)) {
            return true;
        }
        if (MatchProcessor.hasWordIn(name1, name2)) {
            return true;
        }

        return false;
    }

    static hasWordIn(str1, str2) {
        var words = str1.split(' ');
        return words.some((word) => str2.includes(word));
    }

    static checkMatchType (matcher, location, reverseResult, matchTypeSummary) {
        if (matcher(location, reverseResult)) {
            matchTypeSummary.count += 1;
            matchTypeSummary.matchList.push(reverseResult)
        }
    }
}